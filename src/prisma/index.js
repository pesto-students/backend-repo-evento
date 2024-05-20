const {PrismaClient} = require("@prisma/client");

const prisma = new PrismaClient({
	log: ["info", "error"],
});

module.exports = prisma;
