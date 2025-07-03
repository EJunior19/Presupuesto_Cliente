let contador = 0;

function agregarProducto() {
  const container = document.getElementById("productosContainer");
  const fieldset = document.createElement("fieldset"); // Usar fieldset para separar productos
  fieldset.className = "producto-item";
  fieldset.innerHTML = `
    <legend>Producto ${contador + 1}</legend>
    <div class="form-group">
      <label>Nombre del Producto:</label>
      <input type="text" class="producto-nombre" required>
    </div>
    <div class="form-group">
      <label>Precio (Gs):</label>
      <input type="text" class="producto-precio" required>
    </div>
    <div class="form-group">
      <label>Cantidad:</label>
      <input type="number" class="producto-cantidad" value="1" required>
    </div>
    <div class="form-group">
      <label>Observaciones:</label>
      <input type="text" class="producto-observacion">
    </div>
  `;
  container.appendChild(fieldset);
  contador++;

  // Evento para formatear números en el precio
  const precioInput = fieldset.querySelector('.producto-precio');
  precioInput.addEventListener('input', function(e) {
    const value = e.target.value.replace(/\D/g, ''); // Eliminar caracteres no numéricos
    const formattedValue = formatearNumero(value); // Formatear
    e.target.value = formattedValue;
  });
}

function formatearNumero(numero) {
  const numberString = numero.toString();
  const parts = [];

  for (let i = numberString.length; i > 0; i -= 3) {
    parts.push(numberString.substring(Math.max(0, i - 3), i));
  }

  return parts.reverse().join('.');
}

function generarPDF() {
  const nombre = document.getElementById("nombreCliente").value;
  const fecha = new Date().toLocaleDateString();

  const nombres = document.querySelectorAll('.producto-nombre');
  const precios = document.querySelectorAll('.producto-precio');
  const cantidades = document.querySelectorAll('.producto-cantidad');
  const observaciones = document.querySelectorAll('.producto-observacion');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Presupuesto de Producto", 105, 15, null, null, "center");
  doc.setFontSize(10);
  doc.text(`Fecha: ${fecha}`, 14, 25);
  doc.text(`Cliente: ${nombre}`, 14, 32);

  let startY = 40;
  let totalAmount = 0; // Variable para almacenar el total

  const productData = Array.from(nombres).map((_, i) => {
    const precio = parseInt(precios[i].value.replace(/\./g, '')); // Eliminar los puntos y convertir a número
    const cantidad = parseInt(cantidades[i].value);
    const totalProducto = precio * cantidad;
    totalAmount += totalProducto; // Sumar al total
    return [
      nombres[i].value,
      `Gs. ${formatearNumero(precio)}`,
      cantidad,
      observaciones[i].value
    ];
  });

  doc.autoTable({
    head: [['Producto', 'Precio', 'Cantidad', 'Observaciones']],
    body: productData,
    startY: startY,
    styles: { halign: 'center' },
    headStyles: { fillColor: '#3498DB' }, // Cabecera azul
    bodyStyles: { fillColor: '#ECF0F1' } // Cuerpo gris claro
  });

  // Agregamos el total con relleno verde
  doc.setFontSize(12);
  doc.setFillColor('#2ecc71'); // Relleno verde
  doc.setTextColor('#FFFFFF'); // Texto blanco
  doc.rect(14, doc.lastAutoTable.finalY + 10, 50, 7, 'F'); // Rectángulo de relleno
  doc.text(`Total: Gs. ${formatearNumero(totalAmount)}`, 15, doc.lastAutoTable.finalY + 15);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Texto negro
  doc.text("Gracias por confiar en nosotros. Estoy a tu disposición para cualquier duda o consulta.", 14, doc.lastAutoTable.finalY + 30);
  doc.text("Asesor: Junior Enciso", 14, doc.lastAutoTable.finalY + 36);
  doc.save(`presupuesto_${nombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`);

  // Mensaje final (éxito)
  document.getElementById("mensajeFinal").textContent = "¡Presupuesto generado con éxito!";
}