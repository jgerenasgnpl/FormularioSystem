require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// --- Configuración de Express ---
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// --- Configuración de Supabase ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: Las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar definidas.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('Cliente de Supabase inicializado para FormularioSystem.');
console.log('Usando tablas: usuariossystem, formulariossystem, modulossystem, preguntassystem, submissionssystem');

// --- Middleware de Autenticación ---
const adminOnly = async (req, res, next) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: 'No se proporcionó ID de usuario para la autorización.' });
    }

    try {
        const { data: user, error } = await supabase
            .from('usuariossystem')
            .select('rol')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'Usuario de autorización no encontrado.' });
        }

        if (user.rol !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor al verificar el rol.', details: error.message });
    }
};

// --- Rutas de la API ---

app.get('/', (req, res) => {
    res.send('Backend FormularioSystem conectado a Supabase funcionando!');
});

// --- Endpoints de Autenticación ---
app.post('/auth/register', adminOnly, async (req, res) => {
    const { email, password, rol } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'El correo y la contraseña son obligatorios.' });
    try {
        const { data: existingUser } = await supabase.from('usuariossystem').select('email').eq('email', email).single();
        if (existingUser) return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        const { data: newUser, error } = await supabase.from('usuariossystem').insert([{ email, password, rol: rol || 'usuario' }]).select().single();
        if (error) throw error;
        delete newUser.password;
        res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor.', details: error.message });
    }
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'El correo y la contraseña son obligatorios.' });
    try {
        const { data: user, error } = await supabase.from('usuariossystem').select('*').eq('email', email).single();
        if (error || !user) return res.status(404).json({ error: 'Usuario no encontrado.' });
        if (user.password !== password) return res.status(401).json({ error: 'Contraseña incorrecta.' });
        delete user.password;
        res.status(200).json({ message: 'Inicio de sesión exitoso', user });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor.', details: error.message });
    }
});

// --- Endpoints de Formularios (CRUD) ---
app.get('/formularios', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('formulariossystem')
            .select(`
                *,
                modulossystem (
                    *,
                    preguntassystem (*)
                )
            `);

        if (error) throw error;

        // Ordenar los resultados en JavaScript
        data.forEach(form => {
            if (form.modulossystem) {
                form.modulossystem.sort((a, b) => a.position - b.position);
                form.modulossystem.forEach(mod => {
                    if (mod.preguntassystem) {
                        mod.preguntassystem.sort((a, b) => a.position - b.position);
                    }
                });
            }
        });

        // Renombrar para compatibilidad con frontend
        data.forEach(form => {
            form.modulos = form.modulossystem;
            delete form.modulossystem;
            if (form.modulos) {
                form.modulos.forEach(mod => {
                    mod.preguntas = mod.preguntassystem;
                    delete mod.preguntassystem;
                });
            }
        });

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los formularios.', details: error.message });
    }
});

// Endpoint público para obtener un formulario específico
app.get('/formularios/public/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('formulariossystem')
            .select(`
                *,
                modulossystem (
                    *,
                    preguntassystem (*)
                )
            `)
            .eq('id', id)
            .eq('is_public', true)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Formulario no encontrado o no es público.' });
        }

        // Ordenar módulos y preguntas
        if (data.modulossystem) {
            data.modulossystem.sort((a, b) => a.position - b.position);
            data.modulossystem.forEach(mod => {
                if (mod.preguntassystem) {
                    mod.preguntassystem.sort((a, b) => a.position - b.position);
                }
            });
        }

        // Renombrar para compatibilidad
        data.modulos = data.modulossystem;
        delete data.modulossystem;
        if (data.modulos) {
            data.modulos.forEach(mod => {
                mod.preguntas = mod.preguntassystem;
                delete mod.preguntassystem;
            });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el formulario público.', details: error.message });
    }
});

app.post('/formularios', adminOnly, async (req, res) => {
    const { name, created_by } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio.' });
    try {
        let validCreatedBy = null;
        
        // Verificar si el usuario existe si se proporciona created_by
        if (created_by) {
            const { data: userExists, error: userError } = await supabase
                .from('usuariossystem')
                .select('id')
                .eq('id', created_by)
                .single();
            
            if (!userError && userExists) {
                validCreatedBy = created_by;
                console.log('Usuario válido encontrado:', created_by);
            } else {
                console.log('Usuario no encontrado, creando formulario con created_by NULL');
            }
        }
        
        // Insertar formulario con created_by válido o NULL
        const { data, error } = await supabase
            .from('formulariossystem')
            .insert([{ name, created_by: validCreatedBy, is_public: false }])
            .select()
            .single();
            
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error al crear formulario:', error);
        res.status(500).json({ error: 'Error al crear el formulario.', details: error.message });
    }
});

// Endpoint para actualizar el estado público de un formulario
app.put('/formularios/:id/public', adminOnly, async (req, res) => {
    const { id } = req.params;
    const { is_public } = req.body;
    
    if (typeof is_public !== 'boolean') {
        return res.status(400).json({ error: 'El campo is_public debe ser un booleano.' });
    }

    try {
        const { data, error } = await supabase
            .from('formulariossystem')
            .update({ is_public })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el estado público del formulario.', details: error.message });
    }
});

// --- Endpoints de Módulos ---
app.post('/formularios/:formularioId/modulos', adminOnly, async (req, res) => {
    const { formularioId } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre del módulo es obligatorio.' });
    try {
        const { count } = await supabase.from('modulossystem').select('count', { count: 'exact' }).eq('formulario_id', formularioId);
        const position = (count || 0) + 1;
        const { data, error } = await supabase.from('modulossystem').insert([{ name, formulario_id: formularioId, position }]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el módulo.', details: error.message });
    }
});

app.put('/modulos/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio.' });
    try {
        const { data, error } = await supabase.from('modulossystem').update({ name }).eq('id', id).select().single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el módulo.', details: error.message });
    }
});

app.delete('/modulos/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('modulossystem').delete().eq('id', id);
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el módulo.', details: error.message });
    }
});

// --- Endpoints de Preguntas ---
app.post('/modulos/:moduloId/preguntas', adminOnly, async (req, res) => {
    const { moduloId } = req.params;
    const { text, type, rules } = req.body;
    if (!text || !type) return res.status(400).json({ error: 'El texto y el tipo son obligatorios.' });
    try {
        const { count } = await supabase.from('preguntassystem').select('count', { count: 'exact' }).eq('modulo_id', moduloId);
        const position = (count || 0) + 1;
        const { data, error } = await supabase.from('preguntassystem').insert([{ text, type, rules, modulo_id: moduloId, position }]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la pregunta.', details: error.message });
    }
});

app.put('/preguntas/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    const { text, type, rules } = req.body;
    if (!text || !type) {
        return res.status(400).json({ error: 'El texto y el tipo son obligatorios.' });
    }
    try {
        const { data, error } = await supabase.from('preguntassystem').update({ text, type, rules }).eq('id', id).select().single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la pregunta.', details: error.message });
    }
});

app.delete('/preguntas/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('preguntassystem').delete().eq('id', id);
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la pregunta.', details: error.message });
    }
});

// --- Endpoints de Datos Geográficos ---
app.get('/geodata/departamentos', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('geografia_colombia')
            .select('departamento')
            .order('departamento', { ascending: true });
        if (error) throw error;
        
        const uniqueDepartamentos = [...new Set(data.map(row => row.departamento))];
        res.status(200).json(uniqueDepartamentos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener departamentos.', details: error.message });
    }
});

app.get('/geodata/municipios/:departamento', async (req, res) => {
    const { departamento } = req.params;
    try {
        const { data, error } = await supabase
            .from('geografia_colombia')
            .select('municipio')
            .eq('departamento', departamento)
            .order('municipio', { ascending: true });
        if (error) throw error;
        res.status(200).json(data.map(row => row.municipio));
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener municipios.', details: error.message });
    }
});

// --- Endpoints de Envíos/Submissions ---
app.get('/submissions', adminOnly, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('submissionssystem')
            .select(`
                id,
                created_at,
                formulariossystem ( name ),
                usuariossystem ( email ),
                respuestas
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Renombrar para compatibilidad
        data.forEach(sub => {
            sub.formularios = sub.formulariossystem;
            sub.usuarios = sub.usuariossystem;
            delete sub.formulariossystem;
            delete sub.usuariossystem;
        });

        res.status(200).json(data);
    } catch (error) {
        console.error('Error al obtener los envíos:', error);
        res.status(500).json({ error: 'Error al obtener los envíos.', details: error.message });
    }
});

// --- Endpoint de Reordenamiento ---
app.post('/reorder', adminOnly, async (req, res) => {
    const { table, ids } = req.body;
    if (!table || !Array.isArray(ids)) {
        return res.status(400).json({ error: 'Tabla e IDs son requeridos.' });
    }

    // Mapear nombre de tabla a tabla system
    const tableMap = {
        'modulos': 'modulossystem',
        'preguntas': 'preguntassystem'
    };

    const systemTable = tableMap[table] || table;

    try {
        const updates = ids.map((id, index) => 
            supabase.from(systemTable).update({ position: index + 1 }).eq('id', id)
        );
        const results = await Promise.all(updates);
        const firstError = results.find(r => r.error);
        if (firstError) throw firstError.error;
        res.status(200).json({ message: `Orden actualizado para ${systemTable}` });
    } catch (error) {
        res.status(500).json({ error: 'Error al reordenar.', details: error.message });
    }
});

// --- Endpoint de Envío con autenticación ---
app.post('/formularios/:formularioId/envios', async (req, res) => {
    const { formularioId } = req.params;
    const { usuario_id, respuestas } = req.body;

    if (!usuario_id || !respuestas || typeof respuestas !== 'object' || Object.keys(respuestas).length === 0) {
        return res.status(400).json({ error: 'Usuario ID y un objeto de respuestas son obligatorios.' });
    }

    try {
        const { data, error } = await supabase
            .from('submissionssystem')
            .insert([{
                formulario_id: formularioId,
                usuario_id: usuario_id,
                respuestas: respuestas
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Formulario enviado y guardado con éxito', submissionId: data.id });

    } catch (error) {
        console.error('Error al guardar el envío del formulario:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al guardar el formulario.', 
            details: error.message 
        });
    }
});

// Endpoint público para envío de formularios sin usuario autenticado
app.post('/formularios/:formularioId/envios/public', async (req, res) => {
    const { formularioId } = req.params;
    const { respuestas } = req.body;

    if (!respuestas || typeof respuestas !== 'object' || Object.keys(respuestas).length === 0) {
        return res.status(400).json({ error: 'Un objeto de respuestas es obligatorio.' });
    }

    try {
        // Verificar que el formulario sea público
        const { data: formulario, error: formError } = await supabase
            .from('formulariossystem')
            .select('is_public')
            .eq('id', formularioId)
            .single();

        if (formError) throw formError;

        if (!formulario || !formulario.is_public) {
            return res.status(403).json({ error: 'Este formulario no acepta envíos públicos.' });
        }

        const { data, error } = await supabase
            .from('submissionssystem')
            .insert([{
                formulario_id: formularioId,
                usuario_id: null,
                respuestas: respuestas
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Formulario enviado y guardado con éxito', submissionId: data.id });

    } catch (error) {
        console.error('Error al guardar el envío público del formulario:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al guardar el formulario.', 
            details: error.message 
        });
    }
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor FormularioSystem escuchando en el puerto ${PORT}`);
    console.log(`Tablas en uso: usuariossystem, formulariossystem, modulossystem, preguntassystem, submissionssystem`);
});
