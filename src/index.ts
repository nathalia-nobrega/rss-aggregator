import { randomUUID } from "crypto";
import http from "http";

type RSSData = {
    id: string;
    title: string;
    author: string;
    url: string;
};

let data: Array<RSSData> = [
    {
        id: randomUUID(),
        title: "sizeof.cat",
        author: "Cool catalan guy",
        url: "https://sizeof.cat/index.xml",
    },
    {
        id: randomUUID(),
        title: "Beej's Blog",
        author: "Beej",
        url: "https://beej.us/blog/rss.xml",
    },
];

// SETUP
const PORT = 8000;
const HOST = "localhost";

const server = http.createServer((req, res) => {
    const { method, url } = req;

    // Route: GET /
    if (method === "GET" && url === "/") {
        res.writeHead(201, { "content-type": "application/json" });
        console.log(`Received request for ${method} ${url}`);
        res.end("HIIIII");
    }
    // Route: GET /links
    else if (method === "GET" && url === "/links") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(data));
    }
    // Route: POST /links
    else if (method === "POST" && url === "/links") {
        let body = "";

        req.setEncoding("utf-8");

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                const newLink: RSSData = JSON.parse(body);
                newLink.id = randomUUID();
                data.push(newLink);
                res.writeHead(201, { "content-type": "application/json" });
                res.end(JSON.stringify(newLink));
            } catch (err) {
                res.writeHead(400, { "content-type": "application/json" });
                console.error(err);
            }
        });
    }
    // Route: PUT /links/{id}
    else if (method === "PUT" && url?.startsWith("/links/")) {
        const id = url.substring(url.lastIndexOf("/") + 1);

        let body = "";

        req.setEncoding("utf-8");

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                // TODO: Throw an error if there is an existing link with the same URL
                let existingLink = data.find((link) => link.id === id);

                if (!existingLink)
                    throw new Error("Couldn't find a link with the given id");

                const updatedLink: RSSData = JSON.parse(body);
                existingLink.author = updatedLink.author;
                existingLink.title = updatedLink.title;
                existingLink.url = updatedLink.url;
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(existingLink));
            } catch (err) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify(err));
            }
        });
    }

    // Route: DELETE /links/{id}
});

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
