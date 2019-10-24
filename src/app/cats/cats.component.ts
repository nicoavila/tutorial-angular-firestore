import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from '../services/firestore/firestore.service';
import { Cat } from '../models/cat';

@Component({
  selector: 'app-cats',
  templateUrl: './cats.component.html',
  styleUrls: ['./cats.component.css']
})
export class CatsComponent implements OnInit, OnDestroy {

  public documentId = null;
  public cats = [];
  public currentStatus = 1;
  public newCatForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    url: new FormControl('', Validators.required),
    id: new FormControl('')
  });

  constructor(
    private firestoreService: FirestoreService
  ) {}

  ngOnInit() {
    this.newCatForm.setValue({
      id: '',
      nombre: '',
      url: ''
    });
    this.firestoreService.getCats().subscribe((catsSnapshot) => {
      this.cats = [];
      catsSnapshot.forEach((catData: any) => {
        this.cats.push({
          id: catData.payload.doc.id,
          data: catData.payload.doc.data()
        });
      });
    });
  }

  ngOnDestroy() {

  }

  public newCat(form, documentId = this.documentId) {
    console.log(`Status: ${this.currentStatus}`);
    if (this.currentStatus === 1) {
      const data = {
        nombre: form.nombre,
        url: form.url
      };
      this.firestoreService.createCat(data).then(() => {
        console.log('Documento creado exitósamente!');
        this.newCatForm.setValue({
          nombre: '',
          url: '',
          id: ''
        });
      }, (error) => {
        console.error(error);
      });
    } else {
      const data = {
        nombre: form.nombre,
        url: form.url
      };
      this.firestoreService.updateCat(documentId, data).then(() => {
        this.currentStatus = 1;
        this.newCatForm.setValue({
          nombre: '',
          url: '',
          id: ''
        });
        console.log('Documento editado exitósamente');
      }, (error) => {
        console.log(error);
      });
    }
  }

  public editCat(documentId) {
    const editSubscribe = this.firestoreService.getCat(documentId).subscribe((cat) => {
      this.currentStatus = 2;
      this.documentId = documentId;
      this.newCatForm.setValue({
        id: documentId,
        nombre: cat.payload.data()['nombre'],
        url: cat.payload.data()['url']
      });
      editSubscribe.unsubscribe();
    });
  }

  public deleteCat(documentId) {
    this.firestoreService.deleteCat(documentId).then(() => {
      console.log('Documento eliminado!');
    }, (error) => {
      console.error(error);
    });
  }
}
