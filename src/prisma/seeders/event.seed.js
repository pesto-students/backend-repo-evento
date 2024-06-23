const {faker} = require("@faker-js/faker");
const prisma = require("../index");

async function main() {
	const categories = await prisma.category.findMany();
	const thumbnails = [
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1712380759/Evento/thumbnail/b_praak2_opndqq.webp",
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1712380563/Evento/thumbnail/zubin_a5pwbx.png",
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1712380563/Evento/thumbnail/arijit_rjqfpd.jpg",
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1712380562/Evento/thumbnail/b_praak_q2fzsf.jpg",
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1712380561/Evento/thumbnail/atif_aslam_vbrojn.png",
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1712380559/Evento/thumbnail/papon_ms61sf.jpg",
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1712380554/Evento/thumbnail/ar_rahman_agweyu.webp",
	];

	const banners = [
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1712680963/Evento/banners/mc6dexmf8biost4q27h6_qfxsmv.webp",
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1712680962/Evento/banners/dlbitczmy7n2v17uc4xy_g4dhmr.webp",
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1712680962/Evento/banners/iqwn93dgvkpc8vp8bvml_pv9avu.webp",
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1712680961/Evento/banners/dhlkrsbpopg5cfpnz23n_zssgfo.webp",
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1714053402/Evento/banners/blagpjnkxhqiyslie97u_u2h5r4.webp",
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1714053402/Evento/banners/hqe8jghm3bjurg0ix0ip_xx0t0d.webp",
		"https://res.cloudinary.com/dv68nyejy/image/upload/v1714053402/Evento/banners/wcoowm5ikue2lvevxxmn_cc8hpk.webp",
	];

	const videos = ["https://www.youtube.com/watch?v=K-iaJKCEp0c", "https://www.youtube.com/watch?v=axs1mSyliDU"];

	await prisma.eventCategory.deleteMany();

	await prisma.event.deleteMany();

	for (let i = 0; i < 10; i++) {
		const randomCategories = faker.helpers.shuffle(categories).slice(0, faker.number.int({min: 1, max: 3}));
		const randomThumbnailUrl = faker.helpers.arrayElement(thumbnails);
		const randomBannerlUrl = faker.helpers.arrayElement(banners);
		const randomVideoUrl = faker.helpers.arrayElement(videos);
		const randomPlan = faker.helpers.arrayElement(["BASIC", "PREMIUM"]);

		const formattedCategories = randomCategories.map((category) => {
			return {
				category: {
					connect: {
						id: category.id,
					},
				},
			};
		});

		await prisma.event.create({
			data: {
				title: faker.lorem.words(6),
				description: faker.lorem.paragraph(),
				thumbnailUrl: randomThumbnailUrl,
				bannerUrl: randomBannerlUrl,
				videoUrl: faker.datatype.boolean() ? randomVideoUrl : null,
				venue: faker.location.streetAddress(),
				startDate: faker.date.future(),
				endDate: faker.datatype.boolean() ? faker.date.future() : null,
				entryFee: faker.number.int({min: 0, max: 2000}),
				latitude: parseFloat(faker.location.latitude()),
				longitude: parseFloat(faker.location.longitude()),
				organizerName: faker.company.name(),
				organizerEmail: faker.internet.email(),
				organizerPhone: faker.phone.number(),
				plan: randomPlan,
				published: true,
				categories: {
					create: formattedCategories,
				},
                userId: 1
			},
		});
	}
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
