#ifndef JASONS_SAMPLE_CODE_TYPING_TEST_H
#define JASONS_SAMPLE_CODE_TYPING_TEST_H
#pragma once

#include "ScoreManager.h"

#include <iostream>
#include <string>
#include <vector>

// This is a simple header-only typing game for learning all of the current
// C++ keywords. The emphasis in this game is learning to type the key words
// quickly, but hopefully memorization of the totality of the key word list is 
// a by product. Includes key words from C++20. A list of the top scores is
// maintained to show improvement over time. 
//
// To use this game, instantatiate the CppTypingTest class and call the Run() 
// method.  

namespace TypingTest {

static const char* const scoreDataFileName = 
    "cpp_typing_test_scores.txt"; 

const std::vector<std::string> words = 
    {
        "align_as", 
        "align_of",
        "and",
        "and_eq",
        "asm",
        "atomic_cancel",
        "atomic_commit",
        "atomic_noexcept",
        "auto",
        "bitand",
        "bitor",
        "bool",
        "break",
        "case",
        "catch",
        "char",
        "char8_t",
        "char16_t",
        "class",
        "compl",
        "concept",
        "const",
        "consteval",
        "constexpr",
        "constinit",
        "const_cast",
        "continue",
        "co_await",
        "co_return",
        "co_yield",
        "decltype",
        "default",
        "delete",
        "do",
        "double",
        "dynamic_cast",
        "else",
        "enum",
        "explicit",
        "export",
        "extern",
        "false",
        "float",
        "for",
        "friend",
        "goto",
        "if",
        "inline",
        "int",
        "long",
        "mutable",
        "namespace",
        "new",
        "noexcept",
        "not",
        "not_eq",
        "nullptr",
        "operator",
        "or",
        "or_eq",
        "private",
        "protected",
        "public",
        "reflexpr",
        "register",
        "reinterpret_cast",
        "requires",
        "return",
        "short",
        "signed",
        "sizeof",
        "static",
        "static_assert",
        "static_cast",
        "struct",
        "switch",
        "synchronized",
        "template",
        "this",
        "thread_local",
        "throw",
        "true",
        "try",
        "typedef",
        "typid",
        "typename",
        "union",
        "unsigned",
        "using",
        "virtual",
        "void",
        "volatile",
        "wchar_t",
        "while",
        "xor",
        "xor_eq"
    }; 

const std::vector<std::string> words_short = 
    {
        "align_as", 
        "align_of",
        "and",
        "and_eq",
        "asm",
        "atomic_cancel",
        "atomic_commit",
        "atomic_noexcept",
        "auto",
        "bitand",
        "bitor",
        "bool",
        "break",
        "case",
        "catch",
        "char",
        "char8_t",
        "char16_t",
        "class",
        "compl",
        "concept",
        "const",
        "consteval",
        "constexpr",
        "constinit",
        "const_cast",
        "continue",
        "co_await",
        "co_return",
        "co_yield",
        "decltype",
        "default",
        "delete",
        "do",
    };

class CppTypingTest
{
public:

    void Run()
    {
        std::cout << "***********************\n";
        std::cout << "** Welcome to the C++ Timed Typing Test!! \n";
        std::cout << "********* \n";
        
        ScoreManager sm(scoreDataFileName);
        if(!sm.load()){
            std::cout << "Couldn't find data file. Aborting.\n";
            return;
        }
        
        std::cout << "Hit return to start the test (or ctrl-c to abort):";
    
        char input;
        std::cin.get(input);
    
        // Start timer
        auto start = std::chrono::system_clock::now();

        bool testCompleted = true;
        size_t totalChars = 0;

        // Using the short list for now.
        auto words = words_short;
        for (const auto& word : words)
        {
            bool passed = false;
            while(!passed)
            {
                std::cout << word << "\n"; 
                std::string wIn;
                std::cin >> wIn;

                if(wIn == word)
                {
                    passed = true;
                    totalChars += word.length() + 1;
                }
                else if(wIn == "XXX")
                {
                    testCompleted = false;
                    break;
                }
            }

            if(testCompleted == false)
                break;
        }

        auto end = std::chrono::system_clock::now();
        std::chrono::duration<double> elapsed_seconds = end-start;

        // Check scores:
        std::cout << "Elapsed time: " << elapsed_seconds.count() << " seconds \n";
        const float wpm = 60.0 * static_cast<float>(totalChars)/(elapsed_seconds.count() * 5.0);
        std::cout << "WPM (# chars/5) = " << wpm << "\n";

        sm.getScoreRank(wpm);
        sm.addScore("JEF", wpm, "DUMMY-DATE");
        sm.write();
    }
};
} // Namespace CppTypingTest

#endif // JASONS_SAMPLE_CODE_TYPING_TEST_H