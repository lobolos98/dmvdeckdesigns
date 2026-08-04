import type { APIRoute } from "astro";


const pages = [

"/",

"/services",

"/purchase",

"/process",

"/faq",

"/locations",

"/project-planner",

"/permit-ready-deck-plans",

"/deck-design-maryland",

"/deck-design-virginia",

"/deck-design-washington-dc",

"/deck-design-charles-county-md",

"/deck-design-prince-georges-county-md",

"/deck-design-montgomery-county-md",

"/deck-design-fairfax-va",

"/deck-design-arlington-va",

"/deck-design-loudoun-va"

];




export const GET: APIRoute = () => {


const site = "https://dmvdeckdesigns.com";


const urls = pages.map((page)=>`

<url>

<loc>${site}${page}</loc>

<changefreq>weekly</changefreq>

<priority>${page === "/" ? "1.0":"0.8"}</priority>

</url>

`).join("");



return new Response(

`

<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls}

</urlset>

`,

{

headers:{

"Content-Type":"application/xml"

}

}

);


};