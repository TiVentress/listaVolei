import {onDocumentWritten} from "firebase-functions/v2/firestore";
import {setGlobalOptions} from "firebase-functions/v2"; // <-- 1. IMPORTAÇÃO NOVA
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// 2. DEFINE A REGIÃO GLOBAL PARA TODAS AS FUNÇÕES NESTE FICHEIRO
setGlobalOptions({region: "southamerica-east1"});

/**
 * Atualiza o status de um jogo quando o número de participantes muda.
 */
export const atualizaStatusJogo = onDocumentWritten(
    // 3. O caminho do documento agora é o único argumento
    "jogos/{jogoId}/participantes/{participanteId}",
    async (event) => {
      const {jogoId} = event.params;
      logger.info(`Verificando status para o jogo: ${jogoId}`);

      const jogoRef = db.collection("jogos").doc(jogoId);
      const jogoDoc = await jogoRef.get();
      const dadosJogo = jogoDoc.data();

      if (!dadosJogo) {
        logger.info("Jogo não encontrado. Saindo.");
        return;
      }

      const participantesRef = jogoRef.collection("participantes");
      const confirmadosSnapshot = await participantesRef
          .where("presencaConfirmada", "==", true)
          .get();

      const numConfirmados = confirmadosSnapshot.size;
      const maxParticipantes = dadosJogo.maxParticipantes;

      logger.info(`Confirmados: ${numConfirmados} / Máximo: ${maxParticipantes}`);

      if (numConfirmados >= maxParticipantes) {
        if (dadosJogo.status !== "Lotado") {
          logger.info("Jogo lotado. Atualizando status.");
          await jogoRef.update({status: "Lotado"});
        }
      } else {
        if (dadosJogo.status === "Lotado") {
          logger.info("Vagas liberadas. Atualizando status.");
          await jogoRef.update({status: "Aberto"});
        }
      }

      logger.info("Nenhuma alteração de status necessária.");
    },
);

