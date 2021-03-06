var fs = require("fs"),
    brain = require("brain"),
    path = require("path"),
    nomnom = require("nomnom"),
    utils = require("../utils"),
    features = require("../features"),
    collect = require("./collect");

var opts = nomnom.options({
  posDir: {
    position: 0,
    default: __dirname + "/collection/POSITIVES/",
    help: "Directory of cat head images"
  },
  negDir: {
    position: 1,
    default: __dirname + "/collection/NEGATIVES/",
    help: "Directory of negative images"
  },
  outfile: {
    default: __dirname + "/network.json",
    help: "file to save network JSON to"
  },
  sample: {
    flag: true,
    help: "whether to sub-sample the negative images"
  },
  limit: {
    default: 10000,
    help: "maximum number of images to use from each directory"
  }
}).colors().parse();

var params = {
  HOG: {
    cellSize: 6,
    blockSize: 2,
    blockStride: 1,
    bins: 6,
    norm: "L2"
  },
  nn: {
    hiddenLayers: [10, 10],
    learningRate: 0.2
  },
  train: {
    errorThresh: 0.05,
    log: true,
    logPeriod: 1
  }
};

trainNetwork(params)

function trainNetwork(params) {
  var samples = opts.sample ? 1 : 0;
  var data = collect.collectData(opts.posDir, opts.negDir, samples,
                                 opts.limit, params);

  console.log("training on", data.length);
  console.log("feature size:", data[0].input.length)

  var network = new brain.NeuralNetwork(params.nn);

  var stats = network.train(data, params.train);

  console.log("stats:", stats);
  console.log("parameters:", params);

  var json = JSON.stringify(network.toJSON(), 4)

  fs.writeFile(opts.outfile, json, function (err) {
    if (err) throw err;
    console.log('saved network to', opts.outfile);
  });
}
