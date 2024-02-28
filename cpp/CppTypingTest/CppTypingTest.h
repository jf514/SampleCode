#ifndef JASONS_SAMPLE_CODE_TYPING_TEST_H
#define JASONS_SAMPLE_CODE_TYPING_TEST_H
#pragma once

#include <cstdlib>
#include <iostream>
#include <string>

// This is a simple typing game for learning C++ keywords. The emphasis in this 
// game is learning to type the key words quickly, but hopefully memorization 
// of the totality of the key word lists is a by product. Includes key words from 
// C++20. A list of the top scores is maintained to show improvement over time. 
//
// To use this game, instantatiate the CppTypingTest class and call the Run() 
// method.
namespace SampleCode {

class CppTypingTest
{    
    public:
        // Simple constructor. If scorefile is empty, a default file will be used.
        // numWords allows the test to be abbreviated to the first numWords keywords.
        // If numWords is 0 or greater than the total number of keywords, then the
        // full list is used.
        explicit CppTypingTest(std::string scorefile = "", std::size_t numWords = 0); 

        // Runs the timed test.
        void Run() const;

        // Prints the default scorefile.
        static void PrintDefaultScorefile() {
            std::cout << sDefaultScoreFilename << "\n";
        }

    private: 
        static const std::string sDefaultScoreFilename;

        // Number of words to include in the test.
        std::size_t numWords_;

        // File in which to store scores.
        std::string scorefile_;
}; 

}// Namespace SampleCode

#endif // JASONS_SAMPLE_CODE_TYPING_TEST_H