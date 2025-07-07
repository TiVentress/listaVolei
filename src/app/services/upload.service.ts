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

  /** Faz upload resumável e devolve a URL pública */
  async enviarImagem(arquivo: File, pasta = 'jogos'): Promise<string> {
    const caminho = `${pasta}/${uuidv4()}_${arquivo.name}`;
    const arquivoRef = ref(this.storage, caminho);

    // 1. inicia upload resumável
    const task = uploadBytesResumable(arquivoRef, arquivo);

    // 2. aguarda terminar
    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        null,
        err => reject(err),
        () => resolve()
      );
    });

    // 3. URL já válida
    return getDownloadURL(task.snapshot.ref);
  }
}

