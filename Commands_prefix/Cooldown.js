const cooldowns = new Map();

// Config des cooldowns par commandes
const cooldownConfig = {
    betsolo: 1.5 * 60 *60 * 1000,   // 1h30 entre chaque pari en solo
    bet: 3 * 60 * 60 * 1000, // 3h entre chaque pari en duel
    getyen: 8 * 60 * 60 * 1000, // 8h entre chaque getyen
    sticks: 3.5 * 60 * 60 * 1000, // 3h30 entre chaque sticks
    stickssolo: 6.5 * 60 * 60 * 1000, // 6h30 entre chaque stickssolo
    pfc: 3 * 60 * 60 * 1000 // 3h entre chaque PFC
};

function checkCooldown(userId, commandName, message) {
    const now = Date.now();
    const cooldown = cooldownConfig[commandName] || (60 * 1000); // valeur par défaut = 1 min
    const key = `${userId}-${commandName}`;

    if (cooldowns.has(key)) {
        const lastUse = cooldowns.get(key);
        if (now - lastUse < cooldown) {
            const remaining = cooldown - (now - lastUse);
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

            message.channel.send(
                `⏳ Vous devez attendre ${hours}h ${minutes}min ${seconds}s avant de réutiliser la commande \`${commandName}\`.`
            );
            return false; // ❌ commande refusée
        }
    }

    // ✅ pas de cooldown → on enregistre
    cooldowns.set(key, now);
    return true; // ✅ commande acceptée
}

module.exports = { checkCooldown };
