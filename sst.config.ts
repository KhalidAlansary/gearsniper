/// <reference path="./.sst/platform/config.d.ts" />

const name = "gearsniper";

export default $config({
	app(input) {
		return {
			name,
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "cloudflare",
		};
	},
	async run() {
		const db = new sst.cloudflare.D1("Database");
		const bucket = new sst.cloudflare.Bucket("Bucket");
		const worker = new sst.cloudflare.Worker("Site", {
			assets: { directory: ".svelte-kit/cloudflare" },
			handler: ".svelte-kit/cloudflare/_worker.js",
			link: [bucket, db],
			compatibility: { date: "2026-04-24" },
			url: true,
			transform: {
				worker(args) {
					if (args.scriptName.toString().startsWith(`${name}-production`)) {
						args.scriptName = name;
					}
					args.observability = { enabled: true };
				},
			},
		});
		return { url: worker.url };
	},
});
