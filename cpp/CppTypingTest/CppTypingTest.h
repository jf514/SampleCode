#ifndef JASONS_SAMPLE_CODE_TYPING_TEST_H
#define JASONS_SAMPLE_CODE_TYPING_TEST_H
#pragma once


// This is a simple header-only typing game for learning all of the current
// C++ keywords. The emphasis in this game is learning to type the key words
// quickly, but hopefully memorization of the totality of the key word list is 
// a by product. Includes key words from C++20. A list of the top scores is
// maintained to show improvement over time. 
//
// To use this game, instantatiate the CppTypingTest class and call the Run() 
// method.  

namespace TypingTest {

class CppTypingTest
{
public:
    void Run() const;

}; 

}// Namespace CppTypingTest

#endif // JASONS_SAMPLE_CODE_TYPING_TEST_H