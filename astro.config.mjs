import { defineConfig } from 'astro/config';


export default defineConfig({

  site: "https://dmvdeckdesigns.com",

  output: "static",

  build: {

    format: "directory"

  }

});