main: ScoreManager
	g++ -o main.app main.cpp ScoreManager.o -std=c++17

ScoreManager: ScoreManager.h ScoreManager.cpp
	g++ -c -o ScoreManager.o ScoreManager.cpp -std=c++17

clean: 
	rm ScoreManager.o main.app 
 
  