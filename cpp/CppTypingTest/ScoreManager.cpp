#include "ScoreManager.h"

#include <iostream>
#include <fstream>
#include <sstream>

namespace SampleCode {

bool ScoreManager::Load() {   
    std::ifstream score_file(score_filename_);        // open the file
    if (!score_file.is_open()) {
        return false;
    }

    std::string line;                       // helper variable to store current line
    while (std::getline(score_file, line)) {      // read one line from the file
        std::istringstream ss(line);        // create istringstream of current line
        std::string score, name, date;      // helper variables
        std::getline(ss, score, ',');   // store first column in "first"
        std::getline(ss, name, ',');    // store second column in "second"
        std::getline(ss, date, '\n');   // store third column in "third"

        scores_.insert(std::pair{std::stof(score), ScoreInfo{name, date}});
    }

    std::cout << "Read " << scores_.size() << " scores. \n"; 
    score_file.close();

    return true;
} 

void ScoreManager::AddScore(const std::string& name, float score, const std::string& date) {
    scores_.insert(std::pair{score, ScoreInfo{name, date}});
}

void ScoreManager::PrintScoreRank(float score) const {
    auto it = scores_.lower_bound(score);
    auto rank = std::distance(scores_.begin(), it); 
    std::cout << "Score ranks " <<  rank + 1 << " of " << scores_.size() + 1 << "\n";
}

bool ScoreManager::Write() const { 
    std::ofstream outfile(score_filename_);

    for(const auto& ele : scores_) {
        outfile << ele.first << "," 
            << ele.second.name 
            << "," 
            << ele.second.date 
            << std::endl; 
    }

    outfile.close();

    return true; 
}

void ScoreManager::PrintScores() const {
    std::size_t count = 0;

    std::cout << "*****************************\n";
    if (scores_.empty()) {
        std::cout << "Currently no recorded scores.\n";
    } else {
        std::cout << "Recorded Scores:\n";
        for (const auto& score : scores_) {
            ++count;
            std::cout << count << ": " 
                << score.first << ", " 
                << score.second.name << ", " 
                << score.second.date << "\n";
        }
    }
    std::cout << "*****************************\n";
}

std::size_t ScoreManager::NumScores() const {
    return scores_.size();
}

} // namespace SampleCode
