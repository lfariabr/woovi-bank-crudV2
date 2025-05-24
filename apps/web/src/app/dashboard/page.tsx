'use client';
import React, { useState, Suspense, useEffect } from 'react';
import { usePreloadedQuery, useQueryLoader } from 'react-relay';
import { Loader2 } from 'lucide-react';

import { authStore } from '../../lib/auth-store';
import { AccountList } from '../../components/Account/AccountList';
import type { AccountQuery as AccountQueryType } from '../../__generated__/AccountQuery.graphql';
import { ACCOUNT_QUERY } from './AccountQuery';
import { TransactionsList } from '../../components/Transaction/TransactionsList';


function AccountContent({ 
  queryRef, 
  currentUserAccountId 
}: { 
  queryRef: any; 
  currentUserAccountId: string;
}) {
  const data = usePreloadedQuery<AccountQueryType>(ACCOUNT_QUERY, queryRef);  
  if (!data) {
    return (
      <p style={{ textAlign: 'center', color: '#666', fontSize: '1rem' }}>
        Error: No data loaded.
      </p>
    );
  }
    
  // Get user account information from auth store for direct display
  const { user } = authStore.getState();
  
  return (
    <div>
      {/* Direct user card display similar to transaction page */}
      {user && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-primary mb-2">
            Your Account (ID: {user.accountId || user.taxId || currentUserAccountId})
          </h3>
          
          <div className="border-2 hover:border-[#03d69d] rounded-xl shadow transition-all duration-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#03d69d] to-[#02b987] p-3">
              <h3 className="text-white font-semibold px-1">
                {`${user.first_name || ''} ${user.last_name || ''}`}
              </h3>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Balance:</span>
                <span className="bg-[#edfdf9] text-[#03d69d] font-bold px-4 py-1.5 rounded-full">
                  ${parseFloat(user.balance || '1000.00').toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <AccountList 
        query={data} 
        currentUserAccountId={currentUserAccountId} 
        showOnlyUserAccount={true}
      />
      <hr style={{ margin: '1.5rem 0', border: 'none', height: '1px', backgroundColor: '#e5e7eb' }} />
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#03d69d' }}>
        Transaction History
      </h2>
      
      <TransactionsList 
        query={data} 
        currentUserAccountId={currentUserAccountId}
        amount={0}
      />
    </div>
  );
}

type DashboardPageProps = {
    currentUserAccountId?: string;
};
    
const DashboardPage: React.FC<DashboardPageProps> = () => {
    const { user, token } = authStore.getState();
    const [queryRef, loadQuery] = useQueryLoader<AccountQueryType>(ACCOUNT_QUERY);
    const [cursor, setCursor] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if (user) {
          // Used to debug dash exhibition of user account
            // console.log("AUTH USER OBJECT:", JSON.stringify(user, null, 2));
        }
    }, [user]);

    useEffect(() => {
        if (token && user?.id) {
            try {                loadQuery({ 
                    first: 3, 
                    after: cursor,
                    account_id_sender: user.id,
                    account_id_receiver: user.id,
                    amount: null
                });
            } catch (error) {
                console.error("Error loading account query:", error);
            }
        }
    }, [token, loadQuery, cursor, user]);
    
    if (!isClient) {
        return (
            <div style={{ maxWidth: '768px', margin: '0 auto', padding: '1.5rem 1rem' }}>
                <div style={{ height: '100vh' }} />
            </div>
        );
    }
    
    if (!user || !token) {
        return (
            <div style={{ maxWidth: '768px', margin: '0 auto', padding: '1.5rem 1rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, textAlign: 'center', color: '#333' }}>
                        Please log in to view your account
                    </h3>
                </div>
            </div>
        );
    }
    
    const userAccountId = user.id || "";
    
    return (
        <div style={{ maxWidth: '768px', margin: '0 auto', padding: '1.5rem 1rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.75rem', color: '#03d69d' }}>
                    Account Dashboard
                </h1>
                <hr style={{ margin: '0 0 1.5rem 0', border: 'none', height: '1px', backgroundColor: '#e5e7eb' }} />
                
                {queryRef ? (
                  <Suspense fallback={
                    <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                      <Loader2 className="animate-spin" style={{ height: '24px', width: '24px', color: '#03d69d', margin: '0 auto' }} />
                    </div>
                  }>
                    <AccountContent 
                      queryRef={queryRef} 
                      currentUserAccountId={userAccountId}
                    />
                  </Suspense>
                ) : (
                  <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" style={{ height: '24px', width: '24px', color: '#03d69d', margin: '0 auto' }} />
                  </div>
                )}
            </div>
        </div>
    );
};
        
export default DashboardPage;