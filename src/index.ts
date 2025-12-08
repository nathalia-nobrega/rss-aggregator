import { randomUUID } from "crypto";
import http from "http";

export type RSSFeedData = {
    id: string;
    title: string;
    author: string;
    url: string;
    type: "URL" | "XML";
};

let data: Array<RSSFeedData> = [
    {
        id: randomUUID(),
        title: "sizeof.cat",
        author: "Cool catalan guy",
        url: "https://sizeof.cat/index.xml",
        type: "XML",
    },
    {
        id: randomUUID(),
        title: "Beej's Blog",
        author: "Beej",
        url: "https://beej.us/blog/rss.xml",
        type: "XML",
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
    // Route: GET /feeds
    else if (method === "GET" && url === "/feeds") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(data));
    }
    // Route: GET /feeds/:id
    else if (method === "GET" && url?.startsWith("/feeds/")) {
        try {
            const id = url.substring(url.lastIndexOf("/") + 1);
            if (id.length === 0)
                throw new Error("Required parameter 'id' not found");

            const feedFound = data.find((feed) => feed.id === id);

            if (!feedFound)
                throw new Error("Couldn't find a feed with the given id");

            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify(feedFound));
        } catch (err: any) {
            console.error(err);
            res.writeHead(404, { "content-type": "application/json" });
            res.end(JSON.stringify(err.toString()));
        }
    }
    // Route: POST /feeds
    else if (method === "POST" && url === "/feeds") {
        let body = "";

        req.setEncoding("utf-8");

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                const newFeed: RSSFeedData = JSON.parse(body);
                newFeed.id = randomUUID();
                data.push(newFeed);
                res.writeHead(201, { "content-type": "application/json" });
                res.end(JSON.stringify(newFeed));
            } catch (err: any) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify(err.toString()));
            }
        });
    }
    // Route: PUT /feeds/{id}
    else if (method === "PUT" && url?.startsWith("/feeds/")) {
        try {
            const id = url.substring(url.lastIndexOf("/") + 1);
            if (id.length === 0)
                throw new Error("Required parameter 'id' not found");
            let body = "";

            req.setEncoding("utf-8");

            req.on("data", (chunk) => {
                body += chunk.toString();

                req.on("end", () => {
                    // TODO: Throw an error if there is an existing feed with the same URL
                    let existingFeed = data.find((feed) => feed.id === id);

                    if (!existingFeed)
                        throw new Error(
                            "Couldn't find a feed with the given id"
                        );

                    const updatedFeed: RSSFeedData = JSON.parse(body);
                    existingFeed.author = updatedFeed.author;
                    existingFeed.title = updatedFeed.title;
                    existingFeed.url = updatedFeed.url;
                    res.writeHead(200, {
                        "content-type": "application/json",
                    });
                    res.end(JSON.stringify(existingFeed));
                });
            });
        } catch (err: any) {
            res.writeHead(400, { "content-type": "application/json" });
            res.end(JSON.stringify(err.toString()));
        }
    }
    // Route: DELETE /feeds/{id}
    else if (method === "DELETE" && url?.startsWith("/feeds/")) {
        try {
            const id = url.substring(url.lastIndexOf("/") + 1);
            if (id.length === 0)
                throw new Error("Required parameter 'id' not found");

            const feedToDelete = data.find((feed) => feed.id === id);
            if (!feedToDelete)
                throw new Error("Couldn't find a feed with the given id");

            data.splice(data.indexOf(feedToDelete), 1);

            res.writeHead(204, { "content-type": "application/json" });
            res.end(JSON.stringify("RSS Feed deleted successfully"));
        } catch (err: any) {
            res.writeHead(404, { "content-type": "application/json" });
            res.end(JSON.stringify(err.toString()));
        }
    }
});

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
