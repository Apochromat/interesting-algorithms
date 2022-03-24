import mnist_loader
import network


def run():
    print("hi")
    training_data, validation_data, test_data = mnist_loader.load_data_wrapper()
    toRecognise = []
    net = network.Network([784, 16, 16, 10])
    net.SGD(training_data, 30, 10, 3.0)
    print(net.recognising(toRecognise))


if __name__ == '__main__':
    run()
