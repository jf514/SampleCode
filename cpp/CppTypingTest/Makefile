main: ScoreManager CppTypingTest
	g++ -g -O0 -o test main.cpp ScoreManager.o CppTypingTest.o -std=c++17

ScoreManager: ScoreManager.h ScoreManager.cpp
	g++ -c -g -O0 -o ScoreManager.o ScoreManager.cpp -std=c++20

CppTypingTest: CppTypingTest.h CppTypingTest.cpp
	g++ -c -g -O0 -o CppTypingTest.o CppTypingTest.cpp -std=c++20

clean: 
	rm CppTypingTest.o ScoreManager.o test
 
  