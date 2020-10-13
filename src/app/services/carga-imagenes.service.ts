import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { FileItem } from '../models/file-item';

@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {

  private CARPETA_IMAGENES = 'img';

  constructor(private db: AngularFirestore) { }

  // tslint:disable-next-line: typedef
  cargarImagenesFirebase(imagenes: FileItem[]) {
    const storage = firebase.storage();
    const storageRef = storage.ref();

    for (const item of imagenes) {
      item.estaSubiendo = true;
      if (item.progreso >= 100) {
        continue;
      }
      const uploadTask: firebase.storage.UploadTask = storageRef
        .child(`${this.CARPETA_IMAGENES}/${item.nombreArchivo}`)
        .put(item.archivo);

      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        // Observable de eventos de cambio de estado
        (snapshot) => {
          item.progreso =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },

        // Si hay errores
        (error) => console.error('Error al subir', error),

        // Cuando todo subió bien
        () => {
             console.log('Imagen cargada correctamente');
          // item.url = uploadTask.snapshot.downloadURL; // deprecated
             uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            item.url = downloadURL;
            item.estaSubiendo = false;
            this.guardarImagen({
              nombre: item.nombreArchivo,
              url: item.url,
            });
          });
        }
      );

    }
  }

  // tslint:disable-next-line: typedef
  private guardarImagen(imagen: {nombre: string, url: string}){

    this.db.collection(`/${this.CARPETA_IMAGENES}`).add(imagen);


  }

}
