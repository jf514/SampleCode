main: ScoreManager CppTypingTest
	g++ -o main.app main.cpp ScoreManager.o CppTypingTest.o -std=c++17

ScoreManager: ScoreManager.h ScoreManager.cpp
	g++ -c -o ScoreManager.o ScoreManager.cpp -std=c++17

CppTypingTest: CppTypingTest.h CppTypingTest.cpp
	g++ -c -o CppTypingTest.o CppTypingTest.cpp -std=c++17

clean: 
	rm ScoreManager.o main.app 
 
  