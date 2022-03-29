import mnist_loader
import network
import json

def run():
    layers = [784, 32, 10]
    isLearn = False
    training_data, validation_data, test_data = mnist_loader.load_data_wrapper()
    if not isLearn:
        with open("data.json") as f:
            data = json.load(f)
        net = network.Network(layers, data=data)
    else:
        net = network.Network(layers)
        net.training(training_data, 30, 10, 3.0)
        exportData = {"weights": [net.weights[i].tolist() for i in range(len(layers) - 1)],
                      "biases": [net.biases[i].tolist() for i in range(len(layers) - 1)]}
        jsonString = json.dumps(exportData, ensure_ascii=False)
        jsonFile = open("data.json", "w")
        jsonFile.write(jsonString)
        jsonFile.close()


    toResponse = []
    for i in range(784):
        t = toResponse[i][0]
        if t > 0:
            print("@", end="")
        else:
            print(".", end="")
        if i % 28 == 27:
            print()
    print()
    print(net.recognising(toResponse))


if __name__ == '__main__':
    run()
