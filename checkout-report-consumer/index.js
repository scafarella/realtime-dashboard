'use strict'

const Redis = require('ioredis')
const moment = require('moment')
const zlib = require('zlib')

//---- Constants
const ELASTICACHE_HOST = process.env.ELASTICACHE_HOST
const ELASTICACHE_PORT = process.env.ELASTICACHE_PORT || 6379
process.env.TZ = process.env.TIMEZONE || 'Europe/London'

const CHECKOUT_SUBMITTED_KEY = "checkout:submitted";
const CHECKOUT_PREFULFIMENT_ERROR_KEY = "checkout:error";
const CHECKOUT_CREATED_TOTAL_KEY = "checkout:total-created";
const CHECKOUT_POPULAR_KEY = "checkout:popular";

const oneWeek = 60*60*24*7

//---- Handler
exports.handler = (event, context, callback) => {
  //---- Redis client
  // Opening the connection to Redis here as we must close for the function to finish
  let client = new Redis(ELASTICACHE_PORT, ELASTICACHE_HOST)
  let recordPromises = event.Records
  .map(record => {
    let data = Buffer.from(record.kinesis.data, 'base64').toString('ascii');
    console.log("record.kinesis.data", data)
    return JSON.parse(data)
  })
  .filter(checkout => typeof checkout.data.LAST_MODIFIED_DATE !== 'undefined' && 
    typeof checkout.data.BASKET_SUBTYPE !== 'undefined')
  .map((checkout) => {
    // get the timestamp of the order in the producer's local time
    let timestamp = moment(checkout.data.LAST_MODIFIED_DATE, 'DD/MM/YYYY HH:mm');
    let today = timestamp.format('YYYYMMDD')
    let weekNumber = timestamp.format('w');
    console.log(`Loading data for ${today}`)

    let pipeline = client.pipeline()
    console.log(pipeline)
    // increment daily submitted checkout count
    if(checkout.data.STATE == 'SUBMITTED') {
      pipeline.incr(CHECKOUT_SUBMITTED_KEY+today);
      pipeline.expire(CHECKOUT_SUBMITTED_KEY+today, oneWeek);
      pipeline.incr(CHECKOUT_SUBMITTED_KEY+"week"+weekNumber);
      pipeline.expire(CHECKOUT_SUBMITTED_KEY+"week"+weekNumber, oneWeek);
    }

    //error
    if(checkout.data.STATE == 'PENDING_CUSTOMER_ACTION' ||
      checkout.data.STATE == 'ERROR') {
      //edge case: submitted pendingcustomer action twice
      //edge case: decrement pendiong customer action if submit fixed
      console.log('inc PENDING_CUSTOMER_ACTION');
      pipeline.incr(CHECKOUT_PREFULFIMENT_ERROR_KEY+today);
      pipeline.expire(CHECKOUT_PREFULFIMENT_ERROR_KEY+today, oneWeek);
      console.log(CHECKOUT_PREFULFIMENT_ERROR_KEY+"week"+weekNumber);
      pipeline.incr(CHECKOUT_PREFULFIMENT_ERROR_KEY+"week"+weekNumber);
      pipeline.expire(CHECKOUT_PREFULFIMENT_ERROR_KEY+"week"+weekNumber, oneWeek);
    }

    if(checkout.metadata.operation == 'insert') {
      pipeline.incr(CHECKOUT_CREATED_TOTAL_KEY+today);
      pipeline.expire(CHECKOUT_CREATED_TOTAL_KEY+today, oneWeek);
      console.log(CHECKOUT_CREATED_TOTAL_KEY+"week"+weekNumber);
      pipeline.incr(CHECKOUT_CREATED_TOTAL_KEY+"week"+weekNumber);
      pipeline.expire(CHECKOUT_CREATED_TOTAL_KEY+"week"+weekNumber, oneWeek);
    }

    console.log(CHECKOUT_POPULAR_KEY+"week"+weekNumber);
    pipeline.zincrby(CHECKOUT_POPULAR_KEY+today, 1, checkout.data.BASKET_SUBTYPE);
    pipeline.zincrby(CHECKOUT_POPULAR_KEY+"week"+weekNumber, 1, checkout.data.BASKET_SUBTYPE); 

    // execute our pipeline and finish up
    return pipeline.exec((error, results) => {
      if (!error) {
        console.log(`Finished processing order, number ${results[0][1]} of the day`)
      } else {
        console.log("error processing pipeline", error);
      }
    })
  })

  console.log(`processing ${recordPromises.length} redis requests`);

  Promise.all(recordPromises)
    .then(result => {
      // publish notification of new data
      client.publish('checkout:', 'New order data');

      client.quit()
      callback(null, { message: `Finished processing ${event.Records.length} records` })
    })
    .catch(error => {
      console.log("Error processing lambda", error);
      callback(error)
    })
}
