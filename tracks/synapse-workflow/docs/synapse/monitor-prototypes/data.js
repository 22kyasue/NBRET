window.SYNAPSE_PREVIEW = {
  "schemaVersion": 1,
  "label": "Saved rehearsal · playback",
  "id": "lab-8839d445-84e4-4036-913b-33040d5128ab",
  "date": "2026-10-21T08:17:53.333Z",
  "mode": "ownership-gap",
  "status": "completed-guided-rehearsal",
  "stages": [
    {
      "id": 1,
      "status": "passed",
      "details": "Owned URL and linked API guide reached; registration, normal use and ownership rule observed. The guided runner supports only this declared local protocol.",
      "evidenceIds": [
        "9b1f210c-bf77-4319-aa69-83862e791209",
        "07cb87ce-cbc9-4813-9ce4-3ff45f9bd796"
      ],
      "time": "2026-10-21T08:17:53.356Z",
      "title": "Discover the entry point"
    },
    {
      "id": 2,
      "status": "passed",
      "details": "Two dedicated test identities self-registered through HTTP; no preprovided user credentials.",
      "evidenceIds": [
        "7509d2e5-6ad3-4bb9-94fb-1f0af9d93ce3",
        "1fe910e3-6b7e-4949-8d2b-c65424e8ed81"
      ],
      "time": "2026-10-21T08:17:53.391Z",
      "title": "Register two identities"
    },
    {
      "id": 3,
      "status": "passed",
      "details": "Actual locally received SMTP messages correlated to both registrations; their delivered links verified the accounts. External mail readiness not claimed.",
      "evidenceIds": [
        "9335a404-8079-4a04-86b6-be75356eb482",
        "0603a073-1162-4e58-934e-2a19b90ec845",
        "9e2529d6-f5ef-4fd8-b680-6a497d08ac21",
        "c71fb307-ed2a-44dd-8ddf-85d0d61873ff"
      ],
      "time": "2026-10-21T08:17:53.502Z",
      "title": "Verify delivered email"
    },
    {
      "id": 4,
      "status": "passed",
      "details": "Registered principals corroborated with /api/me; order created and read legitimately; anonymous denial collected.",
      "evidenceIds": [
        "48f9f9ec-1700-46db-8151-55e8e322c58e",
        "c0f7fe42-a2dc-4927-9630-6728fddcd171",
        "2e8c34e4-1e8a-47f8-a399-bceca269fef9",
        "604e8d20-a9c4-4e9f-9029-b4b1c674b500",
        "94fd69ea-e8b9-4694-9d7f-cfc865638bc5"
      ],
      "time": "2026-10-21T08:17:53.605Z",
      "title": "Establish legitimate access"
    },
    {
      "id": 5,
      "status": "passed",
      "details": "Observation-grounded ownership hypothesis recorded before the foreign read, with explicit disconfirmation.",
      "evidenceIds": [
        "2e8c34e4-1e8a-47f8-a399-bceca269fef9",
        "604e8d20-a9c4-4e9f-9029-b4b1c674b500"
      ],
      "time": "2026-10-21T08:17:53.639Z",
      "title": "Form an ownership hypothesis"
    },
    {
      "id": 6,
      "status": "passed",
      "details": "Actual foreign read and controls evaluated: demonstrated.",
      "evidenceIds": [
        "2e8c34e4-1e8a-47f8-a399-bceca269fef9",
        "604e8d20-a9c4-4e9f-9029-b4b1c674b500",
        "1889f65d-f254-434c-a370-1f6f216e47b8",
        "c0f7fe42-a2dc-4927-9630-6728fddcd171",
        "48f9f9ec-1700-46db-8151-55e8e322c58e",
        "94fd69ea-e8b9-4694-9d7f-cfc865638bc5"
      ],
      "time": "2026-10-21T08:17:53.702Z",
      "title": "Test the ownership boundary"
    },
    {
      "id": 7,
      "status": "passed-guided-replay",
      "details": "Fresh HTTP replay agrees with initial result using the separately authored effect checker. Same-host authorship/replay; independent owner/custody verification remains pending.",
      "evidenceIds": [
        "2e8c34e4-1e8a-47f8-a399-bceca269fef9",
        "06ef6f08-b7aa-4ba1-9755-69788317f608",
        "ec8c760d-e02c-4d63-935d-4e1e4525d1c3",
        "d0156816-d02f-4924-9775-7c5a8f541ae7",
        "7ebbdd3d-8529-4e3b-a3d9-cd194cc50c31",
        "6830e5d5-bcbb-421c-97d5-3dbb075bfd87"
      ],
      "time": "2026-10-21T08:17:53.872Z",
      "title": "Replay the selected effect"
    },
    {
      "id": 8,
      "status": "passed",
      "details": "Transport stop and service closure inspected; fresh-generation reset is checked by the two-run suite.",
      "evidenceIds": [],
      "time": "2026-10-21T08:17:53.932Z",
      "title": "Close services & retain evidence"
    }
  ],
  "receipts": [
    {
      "id": "9b1f210c-bf77-4319-aa69-83862e791209",
      "startedAt": "2026-10-21T08:17:53.344Z",
      "identity": "anonymous",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "text/html; charset=utf-8"
        },
        "body": "[REDACTED non-JSON body]",
        "bodySha256": "87e92f09d7a49bcd21b3f45e0b86e0d895230d0cfc8b885c7fe4fb95acad127d",
        "bodyFieldsOmitted": true,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "07cb87ce-cbc9-4813-9ce4-3ff45f9bd796",
      "startedAt": "2026-10-21T08:17:53.350Z",
      "identity": "anonymous",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/api-docs",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"orders\":{}}",
        "bodySha256": "54cbe884671ceb9f5c05c375bbb2a2615397c7666449e35ee6d66116db11c651",
        "bodyFieldsOmitted": true,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "7509d2e5-6ad3-4bb9-94fb-1f0af9d93ce3",
      "startedAt": "2026-10-21T08:17:53.362Z",
      "identity": "owner",
      "identitySource": "operator-declared",
      "request": {
        "method": "POST",
        "url": "http://127.0.0.1:53923/api/register",
        "headers": {
          "content-type": "application/json"
        },
        "body": "{\"email\":\"owner-6ca84266a347@rehearsal.test\",\"[REDACTED FIELD]\":\"[REDACTED]\"}"
      },
      "response": {
        "status": 201,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"[REDACTED FIELD]\":\"[REDACTED]\"}",
        "bodySha256": "e4bbfbdd0226585e5acb468e4f86e9eb0f66c079f8126f29be13d7503c897869",
        "bodyFieldsOmitted": true,
        "bodyRedacted": true
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "1fe910e3-6b7e-4949-8d2b-c65424e8ed81",
      "startedAt": "2026-10-21T08:17:53.377Z",
      "identity": "other",
      "identitySource": "operator-declared",
      "request": {
        "method": "POST",
        "url": "http://127.0.0.1:53923/api/register",
        "headers": {
          "content-type": "application/json"
        },
        "body": "{\"email\":\"other-29e0279bd6a6@rehearsal.test\",\"[REDACTED FIELD]\":\"[REDACTED]\"}"
      },
      "response": {
        "status": 201,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"[REDACTED FIELD]\":\"[REDACTED]\"}",
        "bodySha256": "e4bbfbdd0226585e5acb468e4f86e9eb0f66c079f8126f29be13d7503c897869",
        "bodyFieldsOmitted": true,
        "bodyRedacted": true
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "9335a404-8079-4a04-86b6-be75356eb482",
      "startedAt": "2026-10-21T08:17:53.399Z",
      "identity": "owner",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53922/messages?recipient=[REDACTED]",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"messages\":[{\"id\":\"be09a4c1-17f7-41fb-a9d3-78e0a77f56af\",\"to\":\"owner-6ca84266a347@rehearsal.test\",\"[REDACTED FIELD]\":\"[REDACTED]\",\"buildId\":\"a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b\",\"generation\":\"94ae7589-caaf-40cb-8c3b-f4276cbab0f3\"}]}",
        "bodySha256": "46cfbdb077f4573083d02a123704c541b9e0bf8628fc6f49849d2338555851be",
        "bodyFieldsOmitted": true,
        "bodyRedacted": true
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "0603a073-1162-4e58-934e-2a19b90ec845",
      "startedAt": "2026-10-21T08:17:53.408Z",
      "identity": "owner",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/verify?token=[REDACTED]",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"verified\":true}",
        "bodySha256": "348f299cf43d57826c76c5ef7c8ccc37668b45161b857d4ef09f7125f3381be9",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "7270d3ae-f0cd-4956-a11d-2c789d5499ff",
      "startedAt": "2026-10-21T08:17:53.428Z",
      "identity": "owner",
      "identitySource": "operator-declared",
      "request": {
        "method": "POST",
        "url": "http://127.0.0.1:53923/api/login",
        "headers": {
          "content-type": "application/json"
        },
        "body": "{\"email\":\"owner-6ca84266a347@rehearsal.test\",\"[REDACTED FIELD]\":\"[REDACTED]\"}"
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"[REDACTED FIELD]\":\"[REDACTED]\",\"user\":{\"id\":\"b9c9ee29-4e62-4dd1-a34e-aea40266485c\",\"email\":\"owner-6ca84266a347@rehearsal.test\"}}",
        "bodySha256": "bed72c5b462a7753910ae69c0844f27ca4c275644e1174216b45ad643030698a",
        "bodyFieldsOmitted": false,
        "bodyRedacted": true
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "9e2529d6-f5ef-4fd8-b680-6a497d08ac21",
      "startedAt": "2026-10-21T08:17:53.447Z",
      "identity": "other",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53922/messages?recipient=[REDACTED]",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"messages\":[{\"id\":\"8c136115-2ca8-4a63-9267-255953a7cbd0\",\"to\":\"other-29e0279bd6a6@rehearsal.test\",\"[REDACTED FIELD]\":\"[REDACTED]\",\"buildId\":\"a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b\",\"generation\":\"94ae7589-caaf-40cb-8c3b-f4276cbab0f3\"}]}",
        "bodySha256": "d6b556bd3f66cdb32dd9149bb85b6241b5fd328f34c8f6184391abe463cee991",
        "bodyFieldsOmitted": true,
        "bodyRedacted": true
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "c71fb307-ed2a-44dd-8ddf-85d0d61873ff",
      "startedAt": "2026-10-21T08:17:53.459Z",
      "identity": "other",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/verify?token=[REDACTED]",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"verified\":true}",
        "bodySha256": "348f299cf43d57826c76c5ef7c8ccc37668b45161b857d4ef09f7125f3381be9",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "68abc6dd-df5a-4e69-a6e9-4537c1833ccb",
      "startedAt": "2026-10-21T08:17:53.483Z",
      "identity": "other",
      "identitySource": "operator-declared",
      "request": {
        "method": "POST",
        "url": "http://127.0.0.1:53923/api/login",
        "headers": {
          "content-type": "application/json"
        },
        "body": "{\"email\":\"other-29e0279bd6a6@rehearsal.test\",\"[REDACTED FIELD]\":\"[REDACTED]\"}"
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"[REDACTED FIELD]\":\"[REDACTED]\",\"user\":{\"id\":\"b6a00112-93d8-4c8f-b34d-744ca79c9e22\",\"email\":\"other-29e0279bd6a6@rehearsal.test\"}}",
        "bodySha256": "4b82b80ac1eee1451402aaa32c2a9c78934f94834a9a245f2442cfac172ff97a",
        "bodyFieldsOmitted": false,
        "bodyRedacted": true
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "48f9f9ec-1700-46db-8151-55e8e322c58e",
      "startedAt": "2026-10-21T08:17:53.516Z",
      "identity": "owner",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/api/me",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"user\":{\"id\":\"b9c9ee29-4e62-4dd1-a34e-aea40266485c\",\"email\":\"owner-6ca84266a347@rehearsal.test\"}}",
        "bodySha256": "9ff2a4ad9aff4bc84be3b1dffaebc450e0137405a1f87d365b7f5284746237a7",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "c0f7fe42-a2dc-4927-9630-6728fddcd171",
      "startedAt": "2026-10-21T08:17:53.532Z",
      "identity": "other",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/api/me",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"user\":{\"id\":\"b6a00112-93d8-4c8f-b34d-744ca79c9e22\",\"email\":\"other-29e0279bd6a6@rehearsal.test\"}}",
        "bodySha256": "20385552b06e8597a71e6495d35cc54705b171d84a19f1c388c6ba61e9ea998d",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "2e8c34e4-1e8a-47f8-a399-bceca269fef9",
      "startedAt": "2026-10-21T08:17:53.548Z",
      "identity": "owner",
      "identitySource": "operator-declared",
      "request": {
        "method": "POST",
        "url": "http://127.0.0.1:53923/api/orders",
        "headers": {
          "content-type": "application/json"
        },
        "body": "{\"description\":\"Synthetic rehearsal order 6dafa9b7-f253-407c-9cb9-a8678c6de997\"}"
      },
      "response": {
        "status": 201,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"order\":{\"id\":\"a00b0ac2-f85e-46c3-9f18-cbc93b9b0698\",\"ownerId\":\"b9c9ee29-4e62-4dd1-a34e-aea40266485c\",\"description\":\"Synthetic rehearsal order 6dafa9b7-f253-407c-9cb9-a8678c6de997\"}}",
        "bodySha256": "ee7ed3739b04f509eb6240ce17c51b64c8764d595c7470a27fbeddfd6d3aabd2",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "604e8d20-a9c4-4e9f-9029-b4b1c674b500",
      "startedAt": "2026-10-21T08:17:53.565Z",
      "identity": "owner",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/api/orders/a00b0ac2-f85e-46c3-9f18-cbc93b9b0698",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"order\":{\"id\":\"a00b0ac2-f85e-46c3-9f18-cbc93b9b0698\",\"ownerId\":\"b9c9ee29-4e62-4dd1-a34e-aea40266485c\",\"description\":\"Synthetic rehearsal order 6dafa9b7-f253-407c-9cb9-a8678c6de997\"}}",
        "bodySha256": "ee7ed3739b04f509eb6240ce17c51b64c8764d595c7470a27fbeddfd6d3aabd2",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "94fd69ea-e8b9-4694-9d7f-cfc865638bc5",
      "startedAt": "2026-10-21T08:17:53.584Z",
      "identity": "anonymous",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/api/orders/a00b0ac2-f85e-46c3-9f18-cbc93b9b0698",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 401,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"error\":\"authentication required\"}",
        "bodySha256": "261f7d57777ec45a642c4a33f29a3cfd3ece2a6c4f69ef874227bcde82e5c53c",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "1889f65d-f254-434c-a370-1f6f216e47b8",
      "startedAt": "2026-10-21T08:17:53.659Z",
      "identity": "other",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/api/orders/a00b0ac2-f85e-46c3-9f18-cbc93b9b0698",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"order\":{\"id\":\"a00b0ac2-f85e-46c3-9f18-cbc93b9b0698\",\"ownerId\":\"b9c9ee29-4e62-4dd1-a34e-aea40266485c\",\"description\":\"Synthetic rehearsal order 6dafa9b7-f253-407c-9cb9-a8678c6de997\"}}",
        "bodySha256": "ee7ed3739b04f509eb6240ce17c51b64c8764d595c7470a27fbeddfd6d3aabd2",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "7ebbdd3d-8529-4e3b-a3d9-cd194cc50c31",
      "startedAt": "2026-10-21T08:17:53.722Z",
      "identity": "owner",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/api/me",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"user\":{\"id\":\"b9c9ee29-4e62-4dd1-a34e-aea40266485c\",\"email\":\"owner-6ca84266a347@rehearsal.test\"}}",
        "bodySha256": "9ff2a4ad9aff4bc84be3b1dffaebc450e0137405a1f87d365b7f5284746237a7",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "d0156816-d02f-4924-9775-7c5a8f541ae7",
      "startedAt": "2026-10-21T08:17:53.743Z",
      "identity": "other",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/api/me",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"user\":{\"id\":\"b6a00112-93d8-4c8f-b34d-744ca79c9e22\",\"email\":\"other-29e0279bd6a6@rehearsal.test\"}}",
        "bodySha256": "20385552b06e8597a71e6495d35cc54705b171d84a19f1c388c6ba61e9ea998d",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "06ef6f08-b7aa-4ba1-9755-69788317f608",
      "startedAt": "2026-10-21T08:17:53.772Z",
      "identity": "owner",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/api/orders/a00b0ac2-f85e-46c3-9f18-cbc93b9b0698",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"order\":{\"id\":\"a00b0ac2-f85e-46c3-9f18-cbc93b9b0698\",\"ownerId\":\"b9c9ee29-4e62-4dd1-a34e-aea40266485c\",\"description\":\"Synthetic rehearsal order 6dafa9b7-f253-407c-9cb9-a8678c6de997\"}}",
        "bodySha256": "ee7ed3739b04f509eb6240ce17c51b64c8764d595c7470a27fbeddfd6d3aabd2",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "6830e5d5-bcbb-421c-97d5-3dbb075bfd87",
      "startedAt": "2026-10-21T08:17:53.796Z",
      "identity": "anonymous",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/api/orders/a00b0ac2-f85e-46c3-9f18-cbc93b9b0698",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 401,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"error\":\"authentication required\"}",
        "bodySha256": "261f7d57777ec45a642c4a33f29a3cfd3ece2a6c4f69ef874227bcde82e5c53c",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    },
    {
      "id": "ec8c760d-e02c-4d63-935d-4e1e4525d1c3",
      "startedAt": "2026-10-21T08:17:53.822Z",
      "identity": "other",
      "identitySource": "operator-declared",
      "request": {
        "method": "GET",
        "url": "http://127.0.0.1:53923/api/orders/a00b0ac2-f85e-46c3-9f18-cbc93b9b0698",
        "headers": {},
        "body": null
      },
      "response": {
        "status": 200,
        "headers": {
          "x-lab-build-id": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
          "x-lab-generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
          "content-type": "application/json; charset=utf-8"
        },
        "body": "{\"order\":{\"id\":\"a00b0ac2-f85e-46c3-9f18-cbc93b9b0698\",\"ownerId\":\"b9c9ee29-4e62-4dd1-a34e-aea40266485c\",\"description\":\"Synthetic rehearsal order 6dafa9b7-f253-407c-9cb9-a8678c6de997\"}}",
        "bodySha256": "ee7ed3739b04f509eb6240ce17c51b64c8764d595c7470a27fbeddfd6d3aabd2",
        "bodyFieldsOmitted": false,
        "bodyRedacted": false
      },
      "complete": true,
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3"
    }
  ],
  "cases": [
    {
      "id": "order-ownership-read",
      "title": "Another registered user can read this test order",
      "substatus": "guided-effect-reproduced; independent owner verification pending",
      "interpretation": "A synthetic order was returned to a different corroborated principal in this guided local run. Independent custody and client applicability are not established.",
      "impactType": "exposure",
      "observed": "The other account received the exact owner-created order, with owner and object identifiers matching legitimate controls.",
      "expected": "A registered user may read their own order. A different user and an anonymous requester must not receive it.",
      "demonstratedConsequence": "Exposure of one synthetic order description to one other newly registered test identity.",
      "potentialConsequences": "Other records or interfaces require separate testing; broader reach is unknown.",
      "uncertainties": "Guided/familiar target; trusted same-host collector and reviewer; no external system, independent custody or general coverage claim.",
      "suggestedRepair": "Enforce authenticated ownership for each order lookup at the server data-access boundary, including related interfaces. Preserve legitimate owner access.",
      "manualVerification": "On a fresh admitted target, register and verify two users; create an order as A; confirm A can read it, B cannot receive its body, and anonymous access is denied. Retain identities, build, request and response evidence. Test related paths separately.",
      "basisEvidenceIds": [
        "2e8c34e4-1e8a-47f8-a399-bceca269fef9",
        "06ef6f08-b7aa-4ba1-9755-69788317f608",
        "ec8c760d-e02c-4d63-935d-4e1e4525d1c3",
        "d0156816-d02f-4924-9775-7c5a8f541ae7",
        "7ebbdd3d-8529-4e3b-a3d9-cd194cc50c31",
        "6830e5d5-bcbb-421c-97d5-3dbb075bfd87"
      ],
      "identity": {
        "principal": "other (corroborated by /api/me)",
        "tenant": "not modeled",
        "role": "registered user"
      },
      "environment": {
        "sourceHash": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b"
      },
      "gates": [],
      "reviews": [],
      "ownerVerifications": [],
      "retestPlans": [],
      "retests": [],
      "consequence": {
        "stale": false,
        "document": {
          "caseId": "order-ownership-read",
          "capability": "A different self-registered user receives one synthetic order owned by another test account.",
          "whyPossible": "This observed order-read path returned the owner’s exact protected object to a different authenticated principal. The check is at the server ownership boundary.",
          "severity": {
            "level": "unknown",
            "rationale": "Synthetic local data only. Real asset sensitivity, breadth and client consequence are not assessed."
          },
          "extent": {
            "demonstrated": {
              "description": "One created order, two corroborated registered principals, one read endpoint, one admitted build and generation.",
              "evidenceIds": [
                "2e8c34e4-1e8a-47f8-a399-bceca269fef9",
                "06ef6f08-b7aa-4ba1-9755-69788317f608",
                "ec8c760d-e02c-4d63-935d-4e1e4525d1c3",
                "d0156816-d02f-4924-9775-7c5a8f541ae7",
                "7ebbdd3d-8529-4e3b-a3d9-cd194cc50c31",
                "6830e5d5-bcbb-421c-97d5-3dbb075bfd87"
              ]
            },
            "wider": {
              "description": "Other orders, tenants, write paths and privileged roles were not evaluated.",
              "evidenceIds": [],
              "assumptions": [
                "No broader reach can be inferred from this single object."
              ]
            }
          },
          "accessEffort": {
            "level": "low",
            "rationale": "Two ordinary accounts were self-registered and email-verified within the admitted local environment."
          },
          "repair": {
            "immediate": "Require the authenticated principal to own the requested order before returning its protected body.",
            "broaderRule": "Apply the same ownership invariant to every equivalent data-access path and preserve tenant boundaries if introduced.",
            "legitimateFlowEffects": "Owner create/list/read must remain usable. Denying every read would break legitimate behavior.",
            "acceptanceChecks": [
              "Owner read still returns the exact order.",
              "Other registered user receives no protected order payload.",
              "Anonymous user receives no protected order payload.",
              "Repeat on related interfaces and a genuine changed build before claiming a repair."
            ],
            "effort": {
              "level": "unknown",
              "rationale": "No client code or genuine repair implementation was assessed."
            }
          },
          "sequence": [
            {
              "id": "establish-owner",
              "explanation": "Create an order as A and corroborate both authenticated principals.",
              "evidenceIds": [
                "2e8c34e4-1e8a-47f8-a399-bceca269fef9",
                "06ef6f08-b7aa-4ba1-9755-69788317f608",
                "ec8c760d-e02c-4d63-935d-4e1e4525d1c3",
                "d0156816-d02f-4924-9775-7c5a8f541ae7",
                "7ebbdd3d-8529-4e3b-a3d9-cd194cc50c31",
                "6830e5d5-bcbb-421c-97d5-3dbb075bfd87"
              ],
              "screenshots": [],
              "expected": "The created order belongs to A.",
              "current": "The collected creation and /api/me receipts establish this synthetic object and the two distinct user IDs.",
              "proposedRepaired": "Preserve account registration and owner creation."
            },
            {
              "id": "compare-read",
              "explanation": "Compare legitimate, foreign and anonymous reads against the exact same object.",
              "evidenceIds": [
                "2e8c34e4-1e8a-47f8-a399-bceca269fef9",
                "06ef6f08-b7aa-4ba1-9755-69788317f608",
                "ec8c760d-e02c-4d63-935d-4e1e4525d1c3",
                "d0156816-d02f-4924-9775-7c5a8f541ae7",
                "7ebbdd3d-8529-4e3b-a3d9-cd194cc50c31",
                "6830e5d5-bcbb-421c-97d5-3dbb075bfd87"
              ],
              "screenshots": [],
              "expected": "Only A receives the protected order body.",
              "current": "B received A’s exact order; the legitimate owner control and anonymous denial were retained.",
              "proposedRepaired": "B and anonymous requests receive no protected body; A retains access."
            },
            {
              "id": "repeat-observation",
              "explanation": "Fresh requests reproduce the selected result within the same admitted generation.",
              "evidenceIds": [
                "2e8c34e4-1e8a-47f8-a399-bceca269fef9",
                "06ef6f08-b7aa-4ba1-9755-69788317f608",
                "ec8c760d-e02c-4d63-935d-4e1e4525d1c3",
                "d0156816-d02f-4924-9775-7c5a8f541ae7",
                "7ebbdd3d-8529-4e3b-a3d9-cd194cc50c31",
                "6830e5d5-bcbb-421c-97d5-3dbb075bfd87"
              ],
              "screenshots": [],
              "expected": "A conclusion should survive matching control observations.",
              "current": "The guided replay agrees. Separate owner verification and protected custody remain pending.",
              "proposedRepaired": "Use actual changed-build receipts plus original, related and legitimate controls. No repaired-build result is supplied here."
            }
          ],
          "nextInvestigation": {
            "extendDemonstratedPath": "Only within a separately admitted scope, determine whether other objects or equivalent interfaces share the observed ownership failure.",
            "resolveFixUncertainty": "Obtain an actual changed build and repeat owner/foreign/anonymous controls before describing this as fixed."
          }
        }
      },
      "category": "issuesNeedingOwnerAction"
    }
  ],
  "hypothesis": {
    "disconfirmation": "A complete response to the other corroborated principal contains the exact owner-created protected order; missing/error/quoted evidence is inconclusive.",
    "evidenceIds": [
      "2e8c34e4-1e8a-47f8-a399-bceca269fef9",
      "604e8d20-a9c4-4e9f-9029-b4b1c674b500",
      "c0f7fe42-a2dc-4927-9630-6728fddcd171"
    ],
    "prediction": "The second registered principal cannot receive the first principal’s exact order body.",
    "question": "Does the order-read endpoint enforce the owner boundary between these two registered users?"
  },
  "cleanup": {
    "status": "observed-closed",
    "errors": [],
    "transport": {
      "attempted": 21,
      "sent": 21,
      "completed": 21,
      "errors": 0,
      "denied": 0,
      "active": 0,
      "stopped": true,
      "responseBytes": 4542,
      "dispatched": 21
    },
    "target": {
      "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
      "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
      "mode": "ownership-gap",
      "localOnly": true,
      "closed": true,
      "stopped": true,
      "listening": false,
      "activeConnections": 0,
      "activeHandlers": 0,
      "requests": 19,
      "http": {
        "listening": false,
        "activeConnections": 0,
        "activeHandlers": 0,
        "stopped": true
      },
      "users": [
        {
          "id": "b9c9ee29-4e62-4dd1-a34e-aea40266485c",
          "email": "owner-6ca84266a347@rehearsal.test",
          "verified": true,
          "mailDelivered": true
        },
        {
          "id": "b6a00112-93d8-4c8f-b34d-744ca79c9e22",
          "email": "other-29e0279bd6a6@rehearsal.test",
          "verified": true,
          "mailDelivered": true
        }
      ],
      "orders": [
        {
          "id": "a00b0ac2-f85e-46c3-9f18-cbc93b9b0698",
          "ownerId": "b9c9ee29-4e62-4dd1-a34e-aea40266485c",
          "description": "Synthetic rehearsal order 6dafa9b7-f253-407c-9cb9-a8678c6de997"
        }
      ],
      "mail": {
        "localOnly": true,
        "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
        "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
        "accepted": 2,
        "rejected": 0,
        "httpRequests": 2,
        "messageCount": 2,
        "activeConnections": 0,
        "closed": true,
        "stopped": true,
        "listening": false,
        "smtp": {
          "listening": false,
          "activeConnections": 0,
          "stopped": true
        },
        "http": {
          "listening": false,
          "activeConnections": 0,
          "stopped": true
        }
      }
    },
    "listenerChecks": [
      {
        "origin": "http://127.0.0.1:53923",
        "closed": true,
        "observation": "ECONNREFUSED"
      },
      {
        "origin": "http://127.0.0.1:53922",
        "closed": true,
        "observation": "ECONNREFUSED"
      },
      {
        "origin": "http://127.0.0.1:53921",
        "closed": true,
        "observation": "ECONNREFUSED"
      }
    ],
    "time": "2026-10-21T08:17:53.902Z"
  },
  "requests": {
    "attempted": 21,
    "sent": 21,
    "completed": 21,
    "errors": 0,
    "denied": 0,
    "active": 0,
    "stopped": true,
    "responseBytes": 4542,
    "dispatched": 21
  },
  "limitations": [
    "Openly guided local rehearsal with known generated source; not a blind benchmark or measured autonomous discovery.",
    "Mail is actually delivered over local SMTP into a dedicated local inbox. External provider delivery and credentials are not established.",
    "The typed executor only admits its two numeric loopback origins. Host coding sessions are trusted operators, not OS-isolated investigators.",
    "Evidence identity/build annotations and review are local declarations corroborated by HTTP controls; hashes are not authenticated provenance.",
    "Only one order-read ownership rule is evaluated. No global security, administrator access, database access or repaired-build claim follows.",
    "No arbitrary generated helpers, external scanners, providers or client targets are executed.",
    "Stage 1: passed — Owned URL and linked API guide reached; registration, normal use and ownership rule observed. The guided runner supports only this declared local protocol.",
    "Stage 2: passed — Two dedicated test identities self-registered through HTTP; no preprovided user credentials.",
    "Stage 3: passed — Actual locally received SMTP messages correlated to both registrations; their delivered links verified the accounts. External mail readiness not claimed.",
    "Stage 4: passed — Registered principals corroborated with /api/me; order created and read legitimately; anonymous denial collected.",
    "Stage 5: passed — Observation-grounded ownership hypothesis recorded before the foreign read, with explicit disconfirmation.",
    "Stage 6: passed — Actual foreign read and controls evaluated: demonstrated.",
    "Stage 7: passed-guided-replay — Fresh HTTP replay agrees with initial result using the separately authored effect checker. Same-host authorship/replay; independent owner/custody verification remains pending.",
    "Stage 8: passed — Transport stop and service closure inspected; fresh-generation reset is checked by the two-run suite.",
    "Hypothesis: Does the order-read endpoint enforce the owner boundary between these two registered users?",
    "Trusted local collector/operator receipts; no authenticated external provenance or independent secret custody.",
    "Guided single-object read only; no autonomous discovery, class-wide repair, or general authorization assurance.",
    "Raw response digests are retained metadata; redacted bodies cannot independently verify raw bytes."
  ],
  "baseline": {
    "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
    "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
    "users": 0,
    "orders": 0,
    "messages": 0,
    "listening": true,
    "mailListening": true
  },
  "buildId": "a899ec2033f4083ff6b99ea0fa836843f271353d2a4c3a8b0acb824ba2405c3b",
  "generation": "94ae7589-caaf-40cb-8c3b-f4276cbab0f3",
  "source": {
    "path": "runs/morning-rehearsal-2026-10-21-v2/ownership-gap",
    "files": [
      {
        "file": "summary.json",
        "sha256": "33f5f1f8df259bb5461dc49439fb9d375b2478439e007dfda25e3c87e83b6875"
      },
      {
        "file": "assessment-state.json",
        "sha256": "573ff59336094c055008e3e1e543cbe8a45eab3b93682949411ccfffb4717834"
      },
      {
        "file": "evidence.json",
        "sha256": "594a0d03bd655fd0000357f848bb984a04b1a1578c6a4cbb14d9bc6d418ad617"
      }
    ]
  },
  "references": [
    {
      "bucket": "tobira-archive",
      "manifest": "snapshots/saved-design-split-view/2026-10-13/study.json",
      "manifestSha256": "47d0a69a4b9010f41ab03e0066200618f278aaa21a7cd73ef6a3b9f0ff8a16f7",
      "verified": [
        {
          "path": "analysis.json",
          "bytes": 107021,
          "sha256": "0a6570bb5f578daf58e674c927535a81904e949a1549ed322bf98d294157e3f7"
        },
        {
          "path": "frame0.png",
          "bytes": 267647,
          "sha256": "906fa90ce5e2ff6bcb89c57566eb8c35a0791597332694159d43eed681c5169e"
        },
        {
          "path": "source.info.json",
          "bytes": 9308,
          "sha256": "39acdc0b14ad94794063fc6be4a194391b85614ccfc4e9234ec9e8ce3f0f132e"
        },
        {
          "path": "source.json",
          "bytes": 743,
          "sha256": "02e0d10a019c7ad1a6264bd0de150f5a424d164e7211a91ca124651f15ae9df2"
        },
        {
          "path": "timeline.jpg",
          "bytes": 84950,
          "sha256": "d419c9c3677b40ad38020060e51118e9490b0415f2dcef59b48bde9c518d64b0"
        }
      ],
      "title": "Split-view precision",
      "source": "https://x.com/gabriell_lab/status/2100219330373849371"
    },
    {
      "bucket": "tobira-archive",
      "manifest": "snapshots/saved-design-clean-tab-switching/2026-10-13/study.json",
      "manifestSha256": "b4db0971cd5e41d73bb4ceca980c9320f07d07881dc578b7faa6004121ee5def",
      "verified": [
        {
          "path": "analysis.json",
          "bytes": 75845,
          "sha256": "4b1a1af6096cd9f87662ab1862269e64fde11e5aa5dbfa46275ab4da3977a8db"
        },
        {
          "path": "frame0.png",
          "bytes": 34580,
          "sha256": "ec2163bfacea779294fc5c52c74ef018266b566f650bc77143df401b4ca86b3a"
        },
        {
          "path": "source.info.json",
          "bytes": 8955,
          "sha256": "1b774b15af3692a3824a288de38aa95e7221784e2925e8837ef95592603507e0"
        },
        {
          "path": "source.json",
          "bytes": 446,
          "sha256": "e0369412c26e29eb345b458dc588fa26eaf5ee3e5cf7716214262a5189de4607"
        },
        {
          "path": "timeline.jpg",
          "bytes": 62534,
          "sha256": "5f1e641c68b1a28554195a91d6a79a9f4478a90f8659a878331a6162102655c8"
        }
      ],
      "title": "Clean tab switching",
      "source": "https://x.com/eliakuratli/status/2108248320699498919"
    },
    {
      "bucket": "tobira-archive",
      "manifest": "snapshots/saved-design-focus-reading/2026-10-13/study.json",
      "manifestSha256": "e88693a93ffdeb2cadb4adbf44a656706561cca70b3b916d7e78bc90031f55e4",
      "verified": [
        {
          "path": "analysis.json",
          "bytes": 120470,
          "sha256": "7fc088e56e5ca96b3ff6d8ccd8a15744f0a977df3ed6d5062397b96222644784"
        },
        {
          "path": "frame0.png",
          "bytes": 373265,
          "sha256": "724386a0cde42a8a0491b2ffcddd30b2009c3536444f0e5481a7d45f122d4f2f"
        },
        {
          "path": "source.info.json",
          "bytes": 12740,
          "sha256": "ed3e0ba5b1c9cc3ab14c6dca2121660da0ec7562733a233333ca457f2e12d784"
        },
        {
          "path": "source.json",
          "bytes": 441,
          "sha256": "a5de9ff61ff061c07404355c2c7495c1e53286b0f6483660cb60a5bf4da5ecf4"
        },
        {
          "path": "timeline.jpg",
          "bytes": 103179,
          "sha256": "c045794cf218ce2195af6e49f70e8832b38fd74b160711c3c76a7c86584bf6ee"
        }
      ],
      "title": "Focused reading",
      "source": "https://x.com/mattdonini/status/2107498022422622400"
    }
  ]
};
