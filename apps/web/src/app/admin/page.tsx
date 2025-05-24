'use client';
import React, { useState, Suspense, useEffect } from 'react';
import { usePreloadedQuery, useQueryLoader } from 'react-relay';
import { graphql } from 'react-relay';
import { Loader2 } from 'lucide-react';

import { authStore } from '../../lib/auth-store';
import { AllAccountsList } from '../../components/Account/AllAccountsList';
import type { AccountQuery as AccountQueryType } from '../../__generated__/AccountQuery.graphql';
import { AllAccountsQuery as AllAccountsQueryType } from './AllAccountsQuery';
import type { AllAccountsQuery as AllAccountsQueryRefType } from '../../__generated__/AllAccountsQuery.graphql';

// Separate component for account content using Suspense
function AccountContent({ 
  queryRef, 
  currentUserAccountId 
}: { 
  queryRef: any; 
  currentUserAccountId: string;
}) {
  const data = usePreloadedQuery<AllAccountsQueryRefType>(AllAccountsQueryType, queryRef);
  if (!data) {
    return (
      <p style={{ textAlign: 'center', color: '#666', fontSize: '1rem' }}>
        Error: No data loaded.
      </p>
    );
  }
  
  return (
    <div>
      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#333' }}>
          All Accounts
        </h2>
        <AllAccountsList 
          query={data} 
          currentUserAccountId={currentUserAccountId}
          showOnlyUserAccount={false} 
        />
      </div>
    </div>
  );
}

type AdminPageProps = {
    currentUserAccountId?: string;
};
    
const AdminPage: React.FC<AdminPageProps> = () => {
    const { user, token } = authStore.getState();
    const [queryRef, loadQuery] = useQueryLoader<AccountQueryType>(AllAccountsQueryType);
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if (token && user) {
            try {
                loadQuery({ 
                    first: 2, 
                    after: null,
                });
            } catch (error) {
                console.error("Error loading account query:", error);
            }
        }
    }, [token, loadQuery, user]);
    
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
    
    const userAccountId = user.taxId || "";
    
    return (
        <div style={{ maxWidth: '768px', margin: '0 auto', padding: '1.5rem 1rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.75rem', color: '#03d69d' }}>
                    Account Admin
                </h1>
                <hr style={{ margin: '0 0 1rem 0', border: 'none', height: '1px', backgroundColor: '#e5e7eb' }} />
                
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
        
export default AdminPage;