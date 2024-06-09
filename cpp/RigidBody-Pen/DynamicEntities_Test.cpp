#include "./DynamicEntities.h"
#include "TestUtils.h"

//////////////////////////////////////////////////////////
// DynamicEntity Unit Tests
//////////////////////////////////////////////////////////

int main(void)
{
    //////////////////////////////////////////////////////////
    // Test CalcDerivs for simple harmonic motion.
    {
        SimpleSpringMotion spring(SimpleSpringMotion::State{-1.0, 0.0}, 4);
        SimpleSpringMotion::State springDerivs = spring.CalcDerivs();
        bool testSpringDerivs = TestUtils::FloatEquals(SimpleSpringMotion::State{0.0, 4.0}, springDerivs, 1.0e-6);
        TestUtils::ReportResults(testSpringDerivs, "Test: Spring Derivatives");
    }

    return 0;
}