import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5511985623273";
const WHATSAPP_MESSAGE = encodeURIComponent("enviar_modelo");

const SubmitTemplate = () => {
  return (
    <div className="container py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Enviar Modelo</h1>
            <p className="text-muted-foreground mt-1">
              Contribua com prints de mensagens reais para a comunidade. Escolha o canal abaixo:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* WhatsApp / SMS / Push */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border shadow-card p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-500/10 rounded-xl p-3">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-lg">💬 WhatsApp · 📱 SMS · 🔔 Push</h2>
                  <p className="text-sm text-muted-foreground">Envie o print diretamente pelo WhatsApp</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Abra a conversa no WhatsApp e encaminhe o print do modelo. Nossa equipe irá categorizar e publicar em breve.
              </p>

              {/* QR Code */}
              <div className="flex justify-center py-2">
                <img
                  src="/qrcode-whatsapp.svg"
                  alt="QR Code para enviar modelo via WhatsApp"
                  className="w-48 h-48 rounded-xl border bg-white p-2"
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Escaneie o QR Code acima ou clique no botão abaixo
              </p>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="hero" size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white border-0">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Abrir WhatsApp e enviar print
                </Button>
              </a>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border shadow-card p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-xl p-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-lg">📧 Email</h2>
                  <p className="text-sm text-muted-foreground">Encaminhe o email original</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Encaminhe o email diretamente para{" "}
                <code className="text-primary font-mono font-semibold">modelscrm@gmail.com</code> — preservamos o visual original com imagens e layout.
              </p>
              <a href="mailto:modelscrm@gmail.com">
                <Button variant="outline" size="lg" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Abrir cliente de email
                </Button>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
  );
};

export default SubmitTemplate;
