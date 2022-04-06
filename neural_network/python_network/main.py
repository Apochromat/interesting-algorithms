import network
import json


def run():
    layers = [784, 128, 32, 10]
    isLearn = True
    if not isLearn:
        with open("data.json") as f:
            data = json.load(f)
        net = network.Network(layers, data=data)
    else:
        net = network.Network(layers)
        net.training(30, 10, 2.0)
        exportData = {"weights": [net.weights[i].tolist() for i in range(len(layers) - 1)],
                      "biases": [net.biases[i].tolist() for i in range(len(layers) - 1)]}
        jsonString = json.dumps(exportData, ensure_ascii=False)
        with open("data.json", "w") as f:
            f.write(jsonString)
        with open("data.js", "w") as f:
            f.write("export let coeffs = " + jsonString)


if __name__ == '__main__':
    run()
