#include "CppTypingTest.h"

#include "CppKeywords_p.h"
#include "ScoreManager.h"

#include <array>
#include <chrono>
#include <iostream>
#include <sstream>
#include <span>
#include <string>

namespace SampleCode {
namespace {

// Utility function to put current date into a std::string.
std::string getDate(){
// Get the current date
    auto today = std::chrono::system_clock::now();
    auto dp = std::chrono::floor<std::chrono::days>(today);
    auto ymd = std::chrono::year_month_day{dp};

    std::ostringstream os;
    os << static_cast<unsigned>(ymd.day()) 
        << "-" << static_cast<unsigned>(ymd.month()) 
        << "-" << static_cast<int>(ymd.year());
    return os.str();
}

// Utility to get input from command std::cin:
std::string getInput(){
    std::string input;
    std::getline(std::cin, input);

    return input;
}
} // namespace

// Default location to store test score leaderboard.
const std::string CppTypingTest::sDefaultScoreFilename{"cpp_typing_test_scores.txt"};

CppTypingTest::CppTypingTest(std::string scorefile, std::size_t numWords)
: numWords_(numWords)
, scorefile_(scorefile)
{
    // Clip the numWords to size of the keyword list, if 
    // they are out of bounds. 0 is mapped to full list.
    if(numWords_ == 0 || numWords_ > Cpp20Keywords.size()) {
        numWords_ = Cpp20Keywords.size();
    } 
}

// Main routine containing the test engine.
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
   auto span = std::span(Cpp20Keywords).first(numWords_);
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
        sm.printScoreRank(wpm);
        sm.addScore(initials, wpm, getDate());
        sm.write();
        std::cout << "Current leaderboard:\n";
        sm.printScores();
    } 
}

} // SampleCode