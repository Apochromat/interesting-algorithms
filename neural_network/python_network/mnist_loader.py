import gzip
import pickle
import numpy as np

def load_data():
    f = gzip.open('mnist.pkl.gz', 'rb')
    training_data, validation_data, test_data = pickle.load(f, encoding="latin1")
    f.close()
    return (training_data, validation_data, test_data)

def load_data_wrapper():
    #Загружаем сырые данные из датасета
    tr_d, va_d, te_d = load_data()

    #Придание каждому элементу массива обучающих тестов формы вида массива с 1 столбцом и 784 строками
    training_inputs = [np.reshape(x, (784, 1)) for x in tr_d[0]]
    #Готовим массив с данными результатов обучающих тестов для нейронной сети
    training_results = [vectorized_result(y) for y in tr_d[1]]
    #Склеиваем массивы обучающих тестов и их результатов
    training_data = list(zip(training_inputs, training_results))
    # Придание каждому элементу массива проверяющих тестов формы вида массива с 1 столбцом и 784 строками
    validation_inputs = [np.reshape(x, (784, 1)) for x in va_d[0]]
    #Склеиваем массивы проверяющих тестов и их результатов
    validation_data = list(zip(validation_inputs, va_d[1]))
    # Придание каждому элементу массива тестов формы вида массива с 1 столбцом и 784 строками
    test_inputs = [np.reshape(x, (784, 1)) for x in te_d[0]]
    # Склеиваем массивы тестов и их результатов
    test_data = list(zip(test_inputs, te_d[1]))
    return training_data, validation_data, test_data

def vectorized_result(j):
    """Возвращает 10-мерный единичный вектор со значением 1.0 в j-ой
    позиции и нулями в других местах. Это используется для преобразования цифры
    (0...9) в соответствующий желаемый выходной сигнал нейронной сети."""
    e = np.zeros((10, 1))
    e[j] = 1.0
    return e
