#include "CppTypingTest.h"
#include "ScoreManager.h"

#include <ctime>
#include <iostream>
#include <sstream>
#include <span>
#include <string>
#include <vector>

namespace TypingTest {

// Default location to store test score leaderboard.
const std::string CppTypingTest::sDefaultScoreFilename{"cpp_typing_test_scores.txt"};

// C++20 keywords
const std::vector<std::string> keywords = {
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

// Utility to get input from command std::cin:
std::string getInput(){
    std::string input;
    std::getline(std::cin, input);

    return input;
}

// Main routine 
void CppTypingTest::Run() const
{
    // Start screen.
    std::cout << "***********************\n";
    std::cout << "** Welcome to the C++ Timed Typing Test!! \n";
    std::cout << "***********************\n";
    
    // Deduce data file.
    std::string loadFile;
    if(scorefile_.empty()){
        loadFile = sDefaultScoreFilename;
    } else {
        loadFile = scorefile_;
    }

    // RAII - file resource managed by lifetime of this object
    ScoreManager sm(loadFile);

    // Initial prompt.
    while(true){
        std::cout << "Hit return to start the test, type s to show leaderboard, or ctrl-c to abort: ";
        std::string input = getInput();
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

   // Main loop - allow user to type all words, or type XXX. 
   // (XXX is a secret developer option which allows user to break out
   // early, while still running post game logic.)
   std::cout << "NW: " << numWords_ << "\n";
   auto span = std::span(keywords).first(numWords_);
    for (const auto& word : span){
        std::string wIn;
        // Loop until user types word correctly, or types XXX to 
        // end application early.
        while(true){
            std::cout << word << "\n";
            wIn = getInput();
            if(wIn == word){
                // Add chars to total, count the return character.
                totalChars += word.length() + 1;
                break;
            }
            else if(wIn == "XXX"){
                // Secret debug option 
                break;
            }
        }

        // Exit to post game logic.
        // An easter egg!
        if(wIn == "XXX")
            break;
    }

    // End timer.
    auto end = std::chrono::system_clock::now();
    std::chrono::duration<double> elapsed_seconds = end-start;

    // Check scores:
    std::cout << "Elapsed time: " << elapsed_seconds.count() << " seconds \n";
    const float wpm = 60.0 * static_cast<float>(totalChars)/(elapsed_seconds.count() * 5.0);
    std::cout << "WPM (# chars/5) = " << wpm << "\n\n";

    // Prompt for leader board inclusion.
    std::cout << "Add your initials to leaderboard? (Y/N) \n";
    std::string input = getInput();
    if(input == "y" || input == "Y"){
        std::cout << "Input initials: \n";
        std::string initials = getInput();
        //sm.getScoreRank(wpm);
        sm.addScore(initials, wpm, getDate());
        sm.write();
        std::cout << "Current leaderboard:\n";
        sm.printScores();
    } 
}

} // TypingTest