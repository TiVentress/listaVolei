import { Injectable } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private storage: Storage) {}

  async enviarImagem(arquivo: File, pasta = 'jogos'): Promise<string> {
    const caminho = `${pasta}/${uuidv4()}_${arquivo.name}`;
    const arquivoRef = ref(this.storage, caminho);

    const task = uploadBytesResumable(arquivoRef, arquivo);

    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        null,
        err => reject(err),
        () => resolve()
      );
    });

    return getDownloadURL(task.snapshot.ref);
  }
}

