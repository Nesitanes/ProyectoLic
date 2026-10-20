// ==========================================
// BASE DE DATOS LOCAL DE PAÍSES Y LUGARES TURÍSTICOS
// ==========================================
const paisesDB = {
    "el salvador": {
        name: "El Salvador",
        capital: "San Salvador",
        currency: "Dólar estadounidense (USD)",
        area: "21,041 km²",
        languages: "Español",
        flag: "https://flagcdn.com/sv.svg",
        attractions: [
            { title: "El Tunco", desc: "Famoso pueblo costero y destino de surf en La Libertad.", img: "img/elsalvador/eltunco.jpg" },
            { title: "Volcán Santa Ana", desc: "Senderismo e impresionantes vistas al cráter y su laguna.", img: "img/elsalvador/volcansantaana.jpg" },
            { title: "Puerto del Diablo", desc: "Formación rocosa y mirador turístico en Panchimalco.", img: "img/elsalvador/puertadeldiablo.jpg" }
        ]
    },
    "españa": {
        name: "España",
        capital: "Madrid",
        currency: "Euro (EUR)",
        area: "505,990 km²",
        languages: "Español",
        flag: "https://flagcdn.com/es.svg",
        attractions: [
            { title: "Sagrada Familia", desc: "La icónica obra maestra arquitectónica de Antoni Gaudí en Barcelona.", img: "img/españa/lasagradafamilia.jpg" },
            { title: "Alhambra de Granada", desc: "Impresionante palacio y fortaleza de la época nazarí.", img: "img/españa/alhambra.jpg" },
            { title: "Parque Güell", desc: "Parque público con elementos arquitectónicos modernistas.", img: "img/españa/guell.jpg" }
        ]
    },
    "méxico": {
        name: "México",
        capital: "Ciudad de México",
        currency: "Peso mexicano (MXN)",
        area: "1,964,375 km²",
        languages: "Español",
        flag: "https://flagcdn.com/mx.svg",
        attractions: [
            { title: "Chichén Itzá", desc: "Maravilla del mundo moderno y antigua ciudad maya en Yucatán.", img: "img/mexico/chichen.jpg" },
            { title: "Tulum", desc: "Zona arqueológica maya situada frente al mar Caribe.", img: "img/mexico/tulum.jpg" },
            { title: "Palacio de Bellas Artes", desc: "Máximo recinto cultural de la Ciudad de México.", img: "img/mexico/bellasartes.jpg" }
        ]
    },
    "colombia": {
        name: "Colombia",
        capital: "Bogotá",
        currency: "Peso colombiano (COP)",
        area: "1,141,748 km²",
        languages: "Español",
        flag: "https://flagcdn.com/co.svg",
        attractions: [
            { title: "Ciudad Amurallada", desc: "Histórico centro colonial frente al mar Caribe en Cartagena.", img: "img/colombia/cartagena.jpg" },
            { title: "Parque Tayrona", desc: "Parajes naturales paradisíacos al pie de la Sierra Nevada.", img: "img/colombia/tayrona.jpg" },
            { title: "Monserrate", desc: "Cerro tutelar con vistas panorámicas de Bogotá.", img: "img/colombia/monserrate.jpg" }
        ]
    },
    "estados unidos": {
        name: "Estados Unidos",
        capital: "Washington D. C.",
        currency: "Dólar estadounidense (USD)",
        area: "9,833,520 km²",
        languages: "Inglés",
        flag: "https://flagcdn.com/us.svg",
        attractions: [
            { title: "Estatua de la Libertad", desc: "Icónico monumento símbolo de la libertad en Nueva York.", img: "img/usa/estatua.jpg" },
            { title: "Gran Cañón", desc: "Impresionante formación natural tallada por el río Colorado.", img: "img/usa/grancanon.jpg" },
            { title: "Central Park", desc: "Famoso parque urbano en el corazón de Manhattan.", img: "img/usa/centralpark.jpg" }
        ]
    },
    "argentina": {
        name: "Argentina",
        capital: "Buenos Aires",
        currency: "Peso argentino (ARS)",
        area: "2,780,400 km²",
        languages: "Español",
        flag: "https://flagcdn.com/ar.svg",
        attractions: [
            { title: "Glaciar Perito Moreno", desc: "Impresionante masa de hielo en el Parque Nacional Los Glaciares.", img: "img/argentina/peritomoreno.jpeg" },
            { title: "Cataratas del Iguazú", desc: "Imponentes saltos con pasarelas sobre la garganta del diablo.", img: "img/argentina/iguazuar.jpg" },
            { title: "Caminito en La Boca", desc: "Colorido y tradicional callejón turístico en Buenos Aires.", img: "img/argentina/caminito.jpg" }
        ]
    }
    
};