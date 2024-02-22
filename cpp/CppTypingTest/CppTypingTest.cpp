#include "CppTypingTest.h"
#include "ScoreManager.h"

#include <ctime>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

namespace TypingTest {

static const std::string scoreDataFilename{"cpp_typing_test_scores.txt"}; 

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

const std::vector<std::string> words_very_short = 
    {
        "align_as", 
        "align_of",
        "and",
        "and_eq",
        "asm",
        "atomic_cancel"
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

// Utility function to put current date into a std::string.
// This obselesced by C++20 
std::string getDate(){
    // Get the current system time point
    auto now = std::chrono::system_clock::now();
    
    // Convert the current system time point to a time_t object
    std::time_t now_time = std::chrono::system_clock::to_time_t(now);
    
    // Convert the time_t object to a std::tm structure
    std::tm* now_tm = std::localtime(&now_time);
    
    // Extract year, month, and day from the std::tm structure
    int day = now_tm->tm_mday;          // day of the month (1–31)
    int month = now_tm->tm_mon + 1;     // months since January (0-based)
    int year = now_tm->tm_year + 1900; // years since 1900

    std::ostringstream os;

    os << day << "-" << month << "-" << year;
    return os.str();
}


void CppTypingTest::Run() const
{
    std::cout << "***********************\n";
    std::cout << "** Welcome to the C++ Timed Typing Test!! \n";
    std::cout << "***********************\n";
    
    ScoreManager sm(scoreDataFilename);
    if(!sm.load()){
        std::cout << "Couldn't find data file. Aborting.\n";
        return;
    }
    
    while(true){
        std::cout << "Hit return to start the test, type s to show leaderboard, or ctrl-c to abort:";

        std::string input;
        std::getline(std::cin, input);

        if(input == "s" || input == "S"){
            sm.printScores();
        } else {
            break;
        }
    }


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
    sm.addScore("JEF", wpm, getDate());
    sm.write();
}

} // TypingTest