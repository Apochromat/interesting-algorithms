import mnist_loader
import network
import json


def run():
    layers = [784, 16, 10]
    learn = True
    training_data, validation_data, test_data = mnist_loader.load_data_wrapper()
    with open("test.json") as f: test = json.load(f)
    if not learn:
        with open("data.json") as f: data = json.load(f)
        net = network.Network(layers, data=data)
    else:
        net = network.Network(layers)
        net.StochasticGradientDescent(training_data, 30, 10, 3.0, test_data=None, test=test["testdata"])
        exportData = {"weights": [net.weights[i].tolist() for i in range(len(layers) - 1)], "biases": [net.biases[i].tolist() for i in range(len(layers) - 1)]}
        jsonString = json.dumps(exportData, indent=4, ensure_ascii=False)
        jsonFile = open("data.json", "w")
        jsonFile.write(jsonString)
        jsonFile.close()
    print(net.recognising())
if __name__ == '__main__':
    run()
