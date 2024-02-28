#ifndef JASONS_SAMPLE_CODE_TYPING_TEST_H
#define JASONS_SAMPLE_CODE_TYPING_TEST_H

#include <cstdlib>
#include <iostream>
#include <string>

// This is a simple typing game for learning C++ keywords. The emphasis in this 
// game is learning to type the key words quickly, but hopefully memorization 
// of the totality of the key word lists is a by product. Includes key words from 
// C++20. A list of the top scores is maintained to show improvement over time. 
//
// To use this game, instantiate the CppTypingTest class and call the Run() 
// method.
namespace SampleCode {

class CppTypingTest {
public:
    // Simple constructor. If score_file is empty, a default file will be used.
    // num_words allows the test to be abbreviated to the first num_words keywords.
    // If num_words is 0 or greater than the total number of keywords, then the
    // full list is used.
    explicit CppTypingTest(std::string score_file = "", std::size_t num_words = 0); 

    // Runs the timed test.
    void Run() const;

    // Prints the default score_file.
    static void PrintDefaultScorefile() {
        std::cout << sDefaultScoreFilename_ << "\n";
    }

private: 
    static const std::string sDefaultScoreFilename_;

    // Number of words to include in the test.
    std::size_t num_words_;

    // File in which to store scores.
    std::string score_file_;
}; 

} // Namespace SampleCode

#endif // JASONS_SAMPLE_CODE_TYPING_TEST_H
