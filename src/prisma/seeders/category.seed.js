const prisma = require("../index");

async function main() {
	await prisma.category.createMany({
		data: [
			{
				title: "Music Concert",
			},
			{
				title: "Food & Drink",
			},
			{
				title: "Community & Culture",
			},
			{
				title: "Adventure & Exploration",
			},
			{
				title: "Car & Bike",
			},
		],
	});
}
main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
