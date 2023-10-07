import { performance } from "perf_hooks";
import supertest from "supertest";
import { buildApp, sleep } from "./app";
import { strict as assert } from 'assert';

const app = supertest(buildApp());

// const sleep = (delay: number) => new Promise((resolve => setTimeout(resolve, delay)));

async function basicLatencyTest() {
    await app.post("/reset").expect(204);
    const start = performance.now();
    await app.post("/charge").expect(200);
    await app.post("/charge").expect(200);
    await app.post("/charge").expect(200);
    await app.post("/charge").expect(200);
    await app.post("/charge").expect(200);
    console.log(`Latency: ${performance.now() - start} ms`);
}

async function concurrencyTest() {
    await app.post("/reset").expect(204);

    const promises = [];

    promises.push(
        app.post("/charge")
            .send({delay: 1000, charges: 100})
            .expect(200)
            .then(response => {
                assert(response.body.isAuthorized == true)
            })
    );

    await sleep(500);

    promises.push(
        app.post("/charge")
            .send({delay: 0, charges: 100})
            .expect(200)
            .then(response => {
                assert(response.body.isAuthorized == false)
            })
    );

    Promise.all(promises);
}

async function runTests() {
    // await basicLatencyTest();
    await concurrencyTest();
}

runTests().catch(console.error);
