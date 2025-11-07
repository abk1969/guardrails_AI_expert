#!/usr/bin/env python3
"""
Générateur GARAK personnalisé pour l'application EBIOS RM AI Assistant
URL: https://ebios-rm-ai-assistant-1065555617003.us-west1.run.app/

Usage:
    uv run python -m garak --target_type custom_generator_ebios.EbiosGenerator --probes encoding
"""

import requests
import logging
from typing import List, Optional
from garak.generators.base import Generator

logger = logging.getLogger(__name__)


class EbiosGenerator(Generator):
    """
    Générateur personnalisé pour tester l'application EBIOS RM AI Assistant
    """

    # Configuration
    name = "EBIOS RM AI Assistant"
    description = "Générateur pour l'application EBIOS RM AI Assistant sur Google Cloud Run"
    
    # URL de l'application
    api_url = "https://ebios-rm-ai-assistant-1065555617003.us-west1.run.app/"
    
    # Endpoints possibles (à adapter selon votre API)
    chat_endpoint = "/api/chat"  # Adaptez selon votre API
    completion_endpoint = "/api/completion"  # Adaptez selon votre API
    
    # Configuration du générateur
    supports_multiple_generations = True
    generator_family_name = "Custom"

    def __init__(self, name=None, generations=10):
        """
        Initialise le générateur EBIOS
        
        Args:
            name: Nom du générateur (optionnel)
            generations: Nombre de générations par prompt
        """
        super().__init__(name=name, generations=generations)
        
        self.name = name or self.name
        self.generations = generations
        
        logger.info(f"Initialisation du générateur EBIOS: {self.api_url}")
        
        # Tester la connexion
        try:
            response = requests.get(self.api_url, timeout=10)
            if response.status_code == 200:
                logger.info("✓ Connexion à l'application EBIOS réussie")
            else:
                logger.warning(f"⚠ Application EBIOS répond avec le code {response.status_code}")
        except Exception as e:
            logger.error(f"✗ Impossible de se connecter à l'application EBIOS: {e}")

    def _call_api(self, prompt: str, endpoint: str = None) -> Optional[str]:
        """
        Appelle l'API de l'application EBIOS
        
        Args:
            prompt: Le prompt à envoyer
            endpoint: L'endpoint à utiliser (par défaut: chat_endpoint)
            
        Returns:
            La réponse de l'API ou None en cas d'erreur
        """
        endpoint = endpoint or self.chat_endpoint
        url = f"{self.api_url.rstrip('/')}{endpoint}"
        
        # Adaptez le payload selon votre API
        # Exemple 1: Format OpenAI-like
        payload = {
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
        
        # Exemple 2: Format simple
        # payload = {"prompt": prompt}
        
        # Exemple 3: Format avec paramètres
        # payload = {
        #     "query": prompt,
        #     "temperature": 0.7,
        #     "max_tokens": 500
        # }
        
        headers = {
            "Content-Type": "application/json",
            # Ajoutez vos headers d'authentification si nécessaire
            # "Authorization": f"Bearer {os.getenv('EBIOS_API_KEY')}"
        }
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Adaptez l'extraction de la réponse selon votre API
                # Exemple 1: Format OpenAI-like
                if "choices" in data:
                    return data["choices"][0]["message"]["content"]
                
                # Exemple 2: Format simple
                if "response" in data:
                    return data["response"]
                
                # Exemple 3: Format avec clé "answer"
                if "answer" in data:
                    return data["answer"]
                
                # Fallback: retourner la réponse brute
                return str(data)
            else:
                logger.error(f"Erreur API: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            logger.error("Timeout lors de l'appel à l'API EBIOS")
            return None
        except Exception as e:
            logger.error(f"Erreur lors de l'appel à l'API EBIOS: {e}")
            return None

    def _call_model(self, prompt: str, generations_this_call: int = 1) -> List[str]:
        """
        Méthode principale appelée par GARAK pour générer des réponses
        
        Args:
            prompt: Le prompt à tester
            generations_this_call: Nombre de générations à produire
            
        Returns:
            Liste des réponses générées
        """
        outputs = []
        
        for i in range(generations_this_call):
            logger.debug(f"Génération {i+1}/{generations_this_call} pour le prompt")
            
            response = self._call_api(prompt)
            
            if response:
                outputs.append(response)
            else:
                # En cas d'erreur, retourner une réponse vide
                outputs.append("")
                logger.warning(f"Génération {i+1} a échoué, réponse vide ajoutée")
        
        return outputs

    def generate(self, prompt: str, generations_this_call: int = 1) -> List[str]:
        """
        Interface publique pour générer des réponses
        
        Args:
            prompt: Le prompt à tester
            generations_this_call: Nombre de générations
            
        Returns:
            Liste des réponses
        """
        return self._call_model(prompt, generations_this_call)


# Pour tester le générateur directement
if __name__ == "__main__":
    print("🧪 Test du générateur EBIOS personnalisé\n")
    
    # Créer une instance du générateur
    generator = EbiosGenerator(generations=3)
    
    # Prompt de test
    test_prompt = "Bonjour, peux-tu m'aider avec une analyse de risques EBIOS RM ?"
    
    print(f"📝 Prompt de test: {test_prompt}\n")
    
    # Générer des réponses
    responses = generator.generate(test_prompt, generations_this_call=2)
    
    print(f"📊 Nombre de réponses: {len(responses)}\n")
    
    for i, response in enumerate(responses, 1):
        print(f"Réponse {i}:")
        print(f"  {response[:200]}..." if len(response) > 200 else f"  {response}")
        print()
    
    print("✅ Test terminé!")

