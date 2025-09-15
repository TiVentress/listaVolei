import {onDocumentWritten} from "firebase-functions/v2/firestore";
import {setGlobalOptions} from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({region: "southamerica-east1"});

export const atualizaStatusJogo = onDocumentWritten(
    "jogos/{jogoId}/participantes/{participanteId}",
    async (event) => {
      const {jogoId} = event.params;
      logger.info(`Função v2 acionada para o jogo: ${jogoId}`);

      const jogoRef = db.collection("jogos").doc(jogoId);
      const jogoDoc = await jogoRef.get();
      const dadosJogo = jogoDoc.data();

      if (!dadosJogo) {
        logger.warn(`Jogo ${jogoId} não encontrado.`);
        return;
      }

      // --- LÓGICA DE CONTAGEM CORRETA ---
      const participantesRef = jogoRef.collection("participantes");
      const participantesSnapshot = await participantesRef.get();
      
      const numParticipantes = participantesSnapshot.size; // CONTAGEM TOTAL
      const maxParticipantes = dadosJogo.maxParticipantes;

      logger.info(`Vagas Ocupadas: ${numParticipantes} / Máximo: ${maxParticipantes}`);

      let novoStatus = dadosJogo.status;

      if (numParticipantes >= maxParticipantes) {
        novoStatus = "Lotado";
      } else {
        novoStatus = "Aberto";
      }

      if (novoStatus !== dadosJogo.status) {
        await jogoRef.update({status: novoStatus});
        logger.info(`Status do jogo ${jogoId} atualizado para ${novoStatus}.`);
      } else {
        logger.info("Nenhuma alteração de status necessária.");
      }
    },
);