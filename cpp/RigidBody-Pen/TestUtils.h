# pragma once

#include <algorithm>
#include <iostream>
#include <string>

//////////////////////////////////////////////////////////
// TestUtils
// Descr: Test utilities used in dummy unit test framework
//////////////////////////////////////////////////////////

namespace TestUtils
{

// Float comparison on containers
template <typename container_type>
bool FloatEquals(const container_type& test, 
    const container_type& expected, 
    double epsilon)
{
    auto comparator = [=](double val0, double val1)
    {
        if(std::abs(val0 - val1) <= epsilon)
        {
            return true;
        }
        else
        {
            return false;
        }
    };
    
    return std::equal(test.begin(), test.end(), expected.begin(), comparator);
}

// Print results to stdout
void ReportResults(bool testPassed, const std::string testName)
{
    if (testPassed)
    {
        std::cout << "Test " << testName << "......passed. \n";
    }
    else
    {
        std::cout << "Test " << testName << ".....FAILED!!!!!!!!!!\n";
    }
}

} // namespace TestUtils