#include "ScoreManager.h"

#include <iostream>
#include <fstream>
#include <sstream>

bool ScoreManager::load() 
{   
    std::ifstream my_file(filename_);        // open the file
    if(!my_file.is_open())
        return false;

    std::string line;                       // helper var to store current line
    while(getline(my_file, line)) {         // read one line from the file
        std::istringstream ss(line);        // create istringstream of current line
        std::string first, second, third;   // helper vars
        getline(ss, first, ',');    // store first column in "first"
        getline(ss, second, ',');   // store second column in "second"
        getline(ss, third, '\n');   // store third column column in "third"

        scores_.insert(std::pair{stof(first),ScoreInfo{second, third}});
    }

    std::cout << "Read " << scores_.size() << " scores. \n"; 
    my_file.close();

    return true;
} 

void ScoreManager::addScore(const std::string& name, float score, const std::string& date)
{
    scores_.insert(std::pair{score, ScoreInfo{name, date}});
}

size_t ScoreManager::getScoreRank(float score) const
{
    auto it = scores_.lower_bound(score);
    auto rank = std::distance(scores_.begin(), it); 
    std::cout << "Score ranks " <<  rank + 1 << " of " << scores_.size() + 1 << "\n";
    return rank;
}

bool ScoreManager::write() const
{ 
    std::ofstream outfile(filename_);

    for(const auto& ele : scores_)
    {
        outfile << ele.first << "," 
            << ele.second.first 
            << "," 
            << ele.second.second 
            << std::endl; 
    }

    outfile.close();

    return true; 
}

void ScoreManager::printScores() const {
    std::size_t count = 0;

    std::cout << "*****************************\n";
    std::cout << "Recorded Scores:\n";
    for(const auto& score : scores_){
        ++count;
        std::cout << count << ": " 
            << score.first << ", " 
            << score.second.first << ", " 
            << score.second.second << "\n";
    }
}