#import <Foundation/Foundation.h>
#import "AppDelegate.h"
#import <TSBackgroundFetch/TSBackgroundFetch.h>

@implementation AppDelegate(AppDelegate)

-(void)application:(UIApplication *)application performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  NSLog(@"RNBackgroundFetch AppDelegate received fetch event");
  TSBackgroundFetch *fetchManager = [TSBackgroundFetch sharedInstance];
  [fetchManager performFetchWithCompletionHandler:completionHandler applicationState:application.applicationState];
}

@end
