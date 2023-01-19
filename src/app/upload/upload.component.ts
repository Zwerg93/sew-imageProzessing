import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {


  constructor() {
  }

  ngOnInit(): void {
  }

  selectetFile?: File;

  @ViewChild('canvas')
  myCanvas?: ElementRef;
  img = new Image()

  pix: any;
  width?: number;
  height?: number;
  ctx: any;
  imgd: any;

  // @ts-ignore
  onFIleSelected(event) {
    if (event == null || event.target == null)
      return;
    const file = event.target.files[0];
    if (file.type.match('image.*')) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (evt) => {
        if (evt.target?.readyState === FileReader.DONE) {
          console.log(1);
          this.img.src = evt.target!.result as string;
          this.img.onload = () => {
            // @ts-ignore
            this.myCanvas.nativeElement.width = this.img.width;
            // @ts-ignore
            this.myCanvas.nativeElement.height = this.img.height;
            this.repaintCanvas();
          };
        }
      };
    }
    this.height = this.img.height;
    this.width = this.img.width;
  }

  repaintCanvas(): void {
    const ctx = (this.myCanvas!.nativeElement as HTMLCanvasElement).getContext('2d');
    if (ctx == null)
      return;
    ctx.drawImage(this.img, 0, 0);


  }

  changeColor() {
    // @ts-ignore
    this.ctx = (this.myCanvas.nativeElement as HTMLCanvasElement).getContext('2d');
    if (this.ctx == null)
      return;
    this.imgd = this.ctx.getImageData(0, 0, this.img.width, this.img.height);
    this.pix = this.imgd.data; // Array mit Pixeln

    this.grayscaleImage(this.pix);
    this.ctx.putImageData(this.imgd, 0, 0);

  }

  grayscaleImage(pix: Uint8ClampedArray) {
    for (let i = 0; i < pix.length; i += 4) {
      const gray = (pix[i] * 0.299 + pix[i + 1] * 0.587 + pix[i + 2] * 0.112);
      pix[i] = gray;
      pix[i + 1] = gray;
      pix[i + 2] = gray;
    }
//    return pix;

  }


  medianFilter() {
    // Erstellen eines Arrays zum Speichern der benachbarten Pixel
    const neighborPix = new Array(9);
    // Erstellen eines Arrays zum Speichern des resultierenden Bildes
    const newPix = new Uint8ClampedArray(this.pix);

    for (let y = 0; y < this.height!; y++) {
      for (let x = 0; x < this.width!; x++) {
        let index = 0;
        // Sammeln der benachbarten Pixel
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            if (x + i >= 0 && x + i < this.width! && y + j >= 0 && y + j < this.height!) {
              let neighborIndex = (x + i + (y + j) * this.width!) * 4;
              neighborPix[index] = this.pix[neighborIndex];
              index++;
            }
          }
        }
        // Sortieren der benachbarten Pixel nach Grauwert
        neighborPix.sort((a, b) => a - b);
        // Ersetzen des aktuellen Pixels durch den Medianwert der benachbarten Pixel
        let currentIndex = (x + y * this.width!) * 4;
        newPix[currentIndex] = neighborPix[4];
      }
    }
    // Überschreiben des Bildes mit dem resultierenden Bild
    for (let i = 0; i < this.pix.length; i++) {
      this.pix[i] = newPix[i];
    }


    console.log("succes")
  }

  correctArtifacts() {

    this.medianFilter();
    this.ctx.putImageData(this.imgd, 0, 0);
  }
}
