def get_suggestions(risk_level: str) -> list[str]:
    """
    Reinforcement engine
    Rule-based suggestion from risk level
    """
    rules = {
        "LOW": [
            "Routine maintenance and visual inspection every 12 months.",
            "Clean drainage systems to prevent water accumulation.",
            "Monitor traffic loads periodically."
        ],
        "MEDIUM": [
            "Schedule detailed structural assessment within 6 months.",
            "Apply surface sealants to prevent further crack propagation.",
            "Implement weight restrictions for heavy vehicles."
        ],
        "HIGH": [
            "Urgent structural patching required for major cracks.",
            "Install sensors for continuous monitoring of vibration and load.",
            "Reroute heavy traffic immediately to reduce load factor."
        ],
        "CRITICAL": [
            "IMMEDIATE CLOSURE of bridge segment.",
            "Emergency reinforcements and shoring required.",
            "Evacuate surrounding risk areas."
        ]
    }
    
    return rules.get(risk_level.upper(), ["No specific suggestions available."])
