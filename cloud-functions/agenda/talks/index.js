/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Datastore = require('@google-cloud/datastore');

// Instantiates a client
const datastore = Datastore();
const talksEntity = "GCSummitTalks";

/**
 * Gets a Datastore key from the kind/key pair in the request.
 *
 * @param {object} requestData Cloud Function request data.
 * @param {string} requestData.key Datastore key string.
 * @param {string} requestData.kind Datastore kind.
 * @returns {object} Datastore key object.
 */
function getKeyFromRequestData (requestData) {
  if (!requestData.key) {
    throw new Error('Key not provided. Make sure you have a "key" property in your request');
  }

  if (!requestData.kind) {
    throw new Error('Kind not provided. Make sure you have a "kind" property in your request');
  }

  return datastore.key([requestData.kind, requestData.key]);
}

/**
 * Gets a Datastore key from the kind/key pair in the request.
 *
 * @param {object} requestData Cloud Function request data.
 * @param {string} requestData.key Datastore key string.
 * @param {string} requestData.kind Datastore kind.
 * @returns {object} Datastore key object.
 */
function retrieveRoomName (reqBody) {
  try {
    console.log("reqBody", reqBody);
  } catch (e) {
    console.warn(e);
  } finally {
  }

  try {
    console.log("queryResult", reqBody.queryResult);
  } catch (e) {
    console.warn(e);
  } finally {
  }

  try {
    console.log("parameters", reqBody.queryResult.parameters);
  } catch (e) {
    console.warn(e);
  } finally {
  }

  try {
    console.log("allRequiredParamsPresent", reqBody.queryResult.allRequiredParamsPresent);
  } catch (e) {
    console.warn(e);
  } finally {
  }

  try {
    console.log("param[roomName]", reqBody.queryResult.parameters["roomName"]);
  } catch (e) {
    console.warn(e);
  } finally {
  }

  try {
    if (reqBody.queryResult != null
          && reqBody.queryResult.parameters != null
          && reqBody.queryResult.parameters["roomName"] != null
          && reqBody.queryResult.allRequiredParamsPresent == true) {
      console.log("Ok. Here we go with room name: " + reqBody.queryResult.parameters["roomName"]);
      return reqBody.queryResult.parameters["roomName"];
    }
    else if (reqBody.room) {
      return reqBody.room;
    }
  } catch (e) {
    console.warn(e);
    if (reqBody.room) {
      return reqBody.room;
    }
  } finally {
  }

  return null;
}

/**
 * Retrieves a record.
 *
 * @example
 * gcloud beta functions call get --data '{"room":"Gravity"}'
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {object} req.body.queryResult As specified by DialogFlow V2 specs
 * @param {string} req.body.room The room name
 * @param {object} res Cloud Function response context.
 */
exports.gcs18DFCFCurrentTalkAtRoom = (req, res) => {
  console.log("Request: ", req);

  const roomName = retrieveRoomName(req.body);

  console.log("Listing Current Talk for Room: '" + roomName + "' ...");
  const query = datastore
                  .createQuery(talksEntity)
                  .filter('roomName', '=', roomName)
                  .order('scheduledStartTime');

  console.log("submitting DataStore query ...");
  datastore
    .runQuery(query)
    .then(results => {
      console.log("Query Result: ", results);

      const talks = results[0];
      console.log("Talks: ", talks);

      var cbMessage = "";

      if(talks.length <= 0) {
        console.log("Empty talks list");
        cbMessage = "Non ci sono ulteriori talk in " + roomName;
      }

      console.log('Talks:');
      cbMessage = "In " + roomName + " puoi ora seguire ";
      talks.forEach(talk => {
        cbMessage = cbMessage + " " + talk.title;
        //const taskKey = task[datastore.KEY];
        //console.log(taskKey.id, task);
      });

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-type", "application/json");
      res.status(200).send(JSON.stringify({
          "fulfillmentText": cbMessage
        }));
    })
    .catch(err => {
      console.error('ERROR:', err);
      var cbMessage = "In questo momento, mmm, non ricordo, prova a chiedermelo di nuovo più tardi!";
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-type", "application/json");
      res.status(200).send(JSON.stringify({
          "fulfillmentText": cbMessage
        }));
    });
};
