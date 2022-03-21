import mnist_loader
import network


def run():
    print("hi")
    training_data, validation_data, test_data = mnist_loader.load_data_wrapper()
    net = network.Network([784, 16, 10])
    net.SGD(training_data, 2, 10, 3.0, test_data=test_data)
    toRecognise = test_data[0][0]
    recognised = net.recognising(toRecognise)
    print(recognised)


if __name__ == '__main__':
    run()
