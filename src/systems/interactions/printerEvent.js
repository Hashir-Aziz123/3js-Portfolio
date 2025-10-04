// minimal: play tiny animation if present, then download a PDF
export default function onPrinterClick({ object }) {

  const link = document.createElement('a');
  link.href = '../../../assets/PDFs/Hashir_Resume.pdf'; // set correct path
  link.download = 'resume.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
