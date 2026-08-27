
// Carga los registros guardados previamente o inicia un arreglo vacío.
function cargarRegistros() {
    try {
        const registrosGuardados = localStorage.getItem('registrosMedicos');
        const registros = registrosGuardados ? JSON.parse(registrosGuardados) : [];
        return Array.isArray(registros) ? registros : [];
    } catch (error) {
        console.error('No se pudieron cargar los registros guardados.', error);
        return [];
    }
}

let registrosMedicos = cargarRegistros();

// Guarda los cambios de forma persistente en el navegador.
function guardarEnLocalStorage() {
    localStorage.setItem('registrosMedicos', JSON.stringify(registrosMedicos));
}

function nombreValido(nombre) {
    return /^[\p{L}]+(?:\s+[\p{L}]+)*$/u.test(nombre.trim());
}

function calcularDigitoVerificador(cuerpo) {
    let suma = 0;
    let multiplicador = 2;

    for (let indice = cuerpo.length - 1; indice >= 0; indice--) {
        suma += Number(cuerpo[indice]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);
    return resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
}

function formatearRut(valor) {
    const caracteresValidos = valor.toUpperCase().replace(/[^0-9K]/g, '');
    if (caracteresValidos.length <= 1) return caracteresValidos;

    const cuerpo = caracteresValidos.slice(0, -1).replace(/K/g, '');
    const digitoVerificador = caracteresValidos.slice(-1);
    const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpoConPuntos}-${digitoVerificador}`;
}

function rutValido(rut) {
    const coincidencia = rut.toUpperCase().match(/^(\d{1,8})-([\dK])$/);
    if (!coincidencia) return false;

    const [, cuerpo, digitoVerificador] = coincidencia;
    return calcularDigitoVerificador(cuerpo) === digitoVerificador;
}

const form = document.getElementById('formFicha');
const rutInput = document.getElementById('rut');
const nombresInput = document.getElementById('nombres');
const apellidosInput = document.getElementById('apellidos');

rutInput.addEventListener('input', () => {
    rutInput.value = formatearRut(rutInput.value);
    rutInput.setCustomValidity(
        rutValido(rutInput.value.replace(/\./g, ''))
            ? ''
            : 'Ingrese un RUT válido, por ejemplo 12.345.678-5.'
    );
});

function validarCampoNombre(input) {
    input.setCustomValidity(
        nombreValido(input.value)
            ? ''
            : 'Use solo letras y espacios.'
    );
}

[nombresInput, apellidosInput].forEach(input => {
    input.addEventListener('input', () => validarCampoNombre(input));
});

form.addEventListener('reset', () => {
    rutInput.setCustomValidity('');
    nombresInput.setCustomValidity('');
    apellidosInput.setCustomValidity('');
});

// logica de guardar y alerta de sobreescritura
form.addEventListener('submit', function(e) {
    e.preventDefault();

    rutInput.value = formatearRut(rutInput.value);
    rutInput.setCustomValidity(
        rutValido(rutInput.value.replace(/\./g, ''))
            ? ''
            : 'Ingrese un RUT válido, por ejemplo 12.345.678-5.'
    );
    validarCampoNombre(nombresInput);
    validarCampoNombre(apellidosInput);

    if (!form.checkValidity()) return;

    const rut = rutInput.value.trim();
    const existeIndice = registrosMedicos.findIndex(r => r.rut === rut);

    if (existeIndice !== -1) {
        const sobrescribir = confirm(`el RUT ${rut} ya se encuentra registrado. ¿Desea sobrescribir los datos existentes?`);
        if (!sobrescribir) return;
    }

    const datosPacientes = {
        rut: rut,
        nombres: document.getElementById('nombres').value.trim(),
        apellidos: document.getElementById('apellidos').value.trim(),
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        direccion: document.getElementById('direccion').value.trim(),
        ciudad: document.getElementById('ciudad').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        estadoCivil: document.getElementById('estadoCivil').value,
        comentarios: document.getElementById('comentarios').value.trim()
    };

    if (existeIndice !== -1) {
        registrosMedicos[existeIndice] = datosPacientes;
        alert('Registro actualizado exitosamente.');
    } else {
        registrosMedicos.push(datosPacientes);
        alert('Ficha médica guardada exitosamente.');
    }

    guardarEnLocalStorage();
    form.reset();
});

// logica de limpiar
document.getElementById('btnLimpiar').addEventListener('click', function() {form.reset();});

//logica de cerrar
document.getElementById('btnCerrar').addEventListener('click', function() {
    if (confirm('¿Está seguro de que desea cerrar la aplicación?')) {
        document.body.innerHTML = "<h2 style='text-align:center; margin-top:50px;'>Aplicación Finalizada.</h2>";
    }
});

// logica de busqueda
document.getElementById('btnBuscar').addEventListener('click', function() {
    const apellidoBuscado = document.getElementById('busquedaApellido').value.trim().toLowerCase();

    if (!apellidoBuscado) {
        alert('Por favor, ingrese un apellido para buscar.');
        return;
    }

    const resultado = registrosMedicos.find(r => r.apellidos.toLowerCase().includes(apellidoBuscado));

    if (resultado) {
        document.getElementById('rut').value = resultado.rut;
        document.getElementById('nombres').value = resultado.nombres;
        document.getElementById('apellidos').value = resultado.apellidos;
        document.getElementById('direccion').value = resultado.direccion;
        document.getElementById('ciudad').value = resultado.ciudad;
        document.getElementById('telefono').value = resultado.telefono;
        document.getElementById('email').value = resultado.email;
        document.getElementById('fechaNacimiento').value = resultado.fechaNacimiento;
        document.getElementById('estadoCivil').value = resultado.estadoCivil;
        document.getElementById('comentarios').value = resultado.comentarios;
        alert('Registro encontrado y cargado en el formulario.');
    } else {
        alert('No se encontraron rigistros que coincidan con ese apellido')
    }
})