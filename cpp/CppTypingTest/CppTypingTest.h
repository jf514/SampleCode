#ifndef JASONS_SAMPLE_CODE_TYPING_TEST_H
#define JASONS_SAMPLE_CODE_TYPING_TEST_H
#pragma once

#include <cstdlib>
#include <iostream>
#include <string>

// This is a simple typing game for learning all of the current
// C++ keywords. The emphasis in this game is learning to type the key words
// quickly, but hopefully memorization of the totality of the key word lists is 
// a by product. Includes key words from C++20. A list of the top scores is
// maintained to show improvement over time. 
//
// To use this game, instantatiate the CppTypingTest class and call the Run() 
// method.  
namespace TypingTest {

class CppTypingTest
{    
public:

    explicit CppTypingTest(std::string scorefile = "", std::size_t numWords = 0) 
    : numWords_(numWords)
    , scorefile_(scorefile)
    {
        assert(numWords_ > 0);
    }

    // Runs the timed test.
    void Run() const;

    // Prints the default scorefile.
    static void PrintDefaultScorefile() {
        std::cout << sDefaultScoreFilename << "\n";
    }

private: 
    static const std::string sDefaultScoreFilename;

    std::size_t numWords_;  // Number of words to include in the test.
    std::string scorefile_; // File in which to store scores.
}; 

}// Namespace CppTypingTest

#endif // JASONS_SAMPLE_CODE_TYPING_TEST_H