import React from "react";
import {
  Html,
  Body,
  Head,
  Heading,
  Hr,
  Container,
  Preview,
  Section,
  Text,
  Link,
  Row,
  Column,
  Img,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

type EmailTemplateProps = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
};

export const ContactEmail: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  lastName,
  phone,
  email,
  company,
  subject,
  message,
}) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Html>
      <Head />
      <Preview>✨ Nouveau message de {firstName} {lastName} - {subject}</Preview>
      <Tailwind>
        <Body className="bg-[#0A0A0A]">
          <Container className="mx-auto py-8 px-4">
            <Section className="bg-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
              {/* En-tête avec gradient */}
              <Section className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
                <Row>
                  <Column>
                    <Heading className="text-white text-2xl m-0 font-bold">
                      📬 Nouveau Message
                    </Heading>
                    <Text className="text-blue-100 m-0 mt-1 text-sm">
                      Reçu le {currentDate}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Badge Priorité */}
              <Section className="px-8 -mb-4 mt-6">
                <Text className="inline-block bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/20">
                  Nouveau contact
                </Text>
              </Section>

              {/* Contenu principal */}
              <Section className="px-8 py-6">
                <Row className="mb-6">
                  <Column>
                    <Text className="text-gray-200 text-lg font-semibold mb-2">
                      {subject}
                    </Text>
                    <Text className="text-gray-300 bg-[#252525] p-6 rounded-xl border border-gray-700/50">
                      {message}
                    </Text>
                  </Column>
                </Row>

                {/* Informations de contact */}
                <Section className="bg-[#252525] rounded-xl p-6 mb-6 border border-gray-700/50">
                  <Heading className="text-gray-200 text-base mb-4 font-semibold">
                    📋 Informations de contact
                  </Heading>
                  <Row>
                    <Column>
                      <Text className="text-gray-300 mb-3">
                        <strong className="text-gray-200">Nom complet :</strong>{" "}
                        {firstName} {lastName}
                      </Text>
                      <Text className="text-gray-300 mb-3">
                        <strong className="text-gray-200">Email :</strong>{" "}
                        <Link href={`mailto:${email}`} className="text-blue-400 hover:text-blue-300">
                          {email}
                        </Link>
                      </Text>
                      {phone && (
                        <Text className="text-gray-300 mb-3">
                          <strong className="text-gray-200">Téléphone :</strong>{" "}
                          <Link href={`tel:${phone}`} className="text-blue-400 hover:text-blue-300">
                            {phone}
                          </Link>
                        </Text>
                      )}
                      {company && (
                        <Text className="text-gray-300 mb-3">
                          <strong className="text-gray-200">Société :</strong>{" "}
                          {company}
                        </Text>
                      )}
                    </Column>
                  </Row>
                </Section>

                {/* Call to Action */}
                <Section className="text-center">
                  <Link
                    href={`mailto:${email}`}
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Répondre au message →
                  </Link>
                </Section>
              </Section>

              {/* Pied de page */}
              <Hr className="border-gray-800 my-0" />
              <Section className="px-8 py-6 bg-[#151515]">
                <Text className="text-gray-400 text-sm text-center">
                  Message envoyé via le formulaire de contact de votre portfolio
                </Text>
                <Text className="text-gray-500 text-xs text-center mt-2">
                  © {new Date().getFullYear()} Portfolio - Tous droits réservés
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ContactEmail; 